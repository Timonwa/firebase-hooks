import { renderHook, waitFor } from "@testing-library/react";
import { applyActionCode } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FakeFirebaseError,
  makeAuth,
  makeUser,
  withAuthProvider,
} from "./_test-helpers.js";
import { useVerifyEmail } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  // reset, not clear: clearAllMocks keeps implementations, so a mockRejectedValue
  // set by one test would still be in place for the next one.
  vi.resetAllMocks();
});

describe("useVerifyEmail", () => {
  it("applies the code once (Strict Mode safe) and reports success", async () => {
    const onVerified = vi.fn();
    const { result } = renderHook(() =>
      useVerifyEmail(makeAuth(), "oob-1", { onVerified }),
    );
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(applyActionCode).toHaveBeenCalledTimes(1);
    expect(onVerified).toHaveBeenCalled();
  });

  it("fails fast on a missing code", () => {
    const { result } = renderHook(() => useVerifyEmail(makeAuth(), null));
    expect(result.current.status).toBe("failed");
    expect(result.current.error).toMatch(/missing/i);
  });

  it("reloads the signed-in user and refreshes the token before onVerified", async () => {
    const user = makeUser();
    const onVerified = vi.fn();
    const { result } = renderHook(() =>
      useVerifyEmail(makeAuth(user), "oob-1", { onVerified }),
    );
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(user.reload).toHaveBeenCalled();
    expect(user.getIdToken).toHaveBeenCalledWith(true);
    expect(onVerified).toHaveBeenCalledWith(user);
    // The documented order: reload + token refresh land before onVerified runs.
    const reloadOrder = vi.mocked(user.reload).mock.invocationCallOrder[0] ?? 0;
    const tokenOrder = vi.mocked(user.getIdToken).mock.invocationCallOrder[0] ?? 0;
    const verifiedOrder = onVerified.mock.invocationCallOrder[0] ?? 0;
    expect(reloadOrder).toBeLessThan(verifiedOrder);
    expect(tokenOrder).toBeLessThan(verifiedOrder);
  });

  it("an invalid code fails with error, code, and cause", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/invalid-action-code",
      "Firebase: Error (auth/invalid-action-code).",
    );
    vi.mocked(applyActionCode).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useVerifyEmail(makeAuth(), "bad-oob"));
    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.error).toBe("Firebase: Error (auth/invalid-action-code).");
    expect(result.current.code).toBe("auth/invalid-action-code");
    expect(result.current.cause).toBe(firebaseError);
  });

  it("notifies the global onError observer with the verify-email action id", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/expired-action-code",
      "Firebase: Error (auth/expired-action-code).",
    );
    vi.mocked(applyActionCode).mockRejectedValue(firebaseError);
    const onError = vi.fn();
    const wrapper = withAuthProvider({ auth: makeAuth(), onError });
    const { result } = renderHook(() => useVerifyEmail(makeAuth(), "stale-oob"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(onError).toHaveBeenCalledWith(firebaseError, {
      action: "verify-email",
      code: "auth/expired-action-code",
      message: "Firebase: Error (auth/expired-action-code).",
    });
  });
});

describe("useVerifyEmail argument forms", () => {
  it("takes just the code, using the provider's auth", async () => {
    const wrapper = withAuthProvider({ auth: makeAuth() });
    const { result } = renderHook(() => useVerifyEmail("oob-1"), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(applyActionCode).toHaveBeenCalledWith(expect.anything(), "oob-1");
  });

  it("takes the code and options, using the provider's auth", async () => {
    const onVerified = vi.fn();
    const wrapper = withAuthProvider({ auth: makeAuth() });
    const { result } = renderHook(() => useVerifyEmail("oob-1", { onVerified }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(onVerified).toHaveBeenCalled();
  });

  it("reads a single null as a missing code, not as a missing auth", () => {
    // searchParams.get("oobCode") returns null when the parameter is absent,
    // and that is the far more common reason to pass one. Treating it as auth
    // would leave the page stuck on "processing" instead of reporting failure.
    const wrapper = withAuthProvider({ auth: makeAuth() });
    const { result } = renderHook(() => useVerifyEmail(null), { wrapper });

    expect(result.current.status).toBe("failed");
    expect(applyActionCode).not.toHaveBeenCalled();
  });

  it("reads a leading null followed by a code as auth that is not ready", () => {
    const wrapper = withAuthProvider({ auth: makeAuth() });
    const { result } = renderHook(() => useVerifyEmail(null, "oob-1"), { wrapper });

    // Still processing: nothing ran, and no failure was reported either.
    expect(result.current.status).toBe("processing");
    expect(applyActionCode).not.toHaveBeenCalled();
  });
});
