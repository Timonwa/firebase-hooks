import { act, renderHook } from "@testing-library/react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, withAuthProvider } from "./_test-helpers.js";
import { useConfirmPasswordReset } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useConfirmPasswordReset", () => {
  it("verifies the code (returning the email) and confirms", async () => {
    const { result } = renderHook(() => useConfirmPasswordReset(makeAuth()));
    let check: Awaited<ReturnType<typeof result.current.verifyCode>> | undefined;
    await act(async () => {
      check = await result.current.verifyCode("oob-1");
    });
    expect(check).toMatchObject({ success: true, email: "user@example.com" });

    await act(async () => {
      await result.current.confirm("oob-1", "new-pw");
    });
    expect(confirmPasswordReset).toHaveBeenCalledWith(
      expect.anything(),
      "oob-1",
      "new-pw",
    );
    expect(result.current.success).toBe(true);
  });

  it("an expired link fails verifyCode with error, code, and cause", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/expired-action-code",
      "Firebase: Error (auth/expired-action-code).",
    );
    vi.mocked(verifyPasswordResetCode).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useConfirmPasswordReset(makeAuth()));
    let check: Awaited<ReturnType<typeof result.current.verifyCode>> | undefined;
    await act(async () => {
      check = await result.current.verifyCode("stale-oob");
    });
    expect(check).toMatchObject({
      success: false,
      code: "auth/expired-action-code",
      cause: firebaseError,
    });
    expect(result.current.error).toBe("Firebase: Error (auth/expired-action-code).");
  });

  it("a failed confirm keeps success false", async () => {
    vi.mocked(confirmPasswordReset).mockRejectedValue(
      new FakeFirebaseError(
        "auth/weak-password",
        "Firebase: Error (auth/weak-password).",
      ),
    );
    const { result } = renderHook(() => useConfirmPasswordReset(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.confirm>> | undefined;
    await act(async () => {
      outcome = await result.current.confirm("oob-1", "123");
    });
    expect(outcome?.success).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe("Firebase: Error (auth/weak-password).");
  });

  it("resetState clears the error for a retry", async () => {
    vi.mocked(confirmPasswordReset).mockRejectedValue(
      new FakeFirebaseError(
        "auth/weak-password",
        "Firebase: Error (auth/weak-password).",
      ),
    );
    const { result } = renderHook(() => useConfirmPasswordReset(makeAuth()));
    await act(async () => {
      await result.current.confirm("oob-1", "123");
    });
    expect(result.current.error).not.toBe(null);
    act(() => result.current.resetState());
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
  });

  it("notifies onError with the flow-specific action ids — verify vs confirm", async () => {
    const verifyError = new FakeFirebaseError(
      "auth/invalid-action-code",
      "Firebase: Error (auth/invalid-action-code).",
    );
    const confirmError = new FakeFirebaseError(
      "auth/expired-action-code",
      "Firebase: Error (auth/expired-action-code).",
    );
    vi.mocked(verifyPasswordResetCode).mockRejectedValue(verifyError);
    vi.mocked(confirmPasswordReset).mockRejectedValue(confirmError);
    const onError = vi.fn();
    const wrapper = withAuthProvider({ auth: makeAuth(), onError });
    const { result } = renderHook(() => useConfirmPasswordReset(makeAuth()), { wrapper });

    await act(async () => {
      await result.current.verifyCode("oob-1");
    });
    expect(onError).toHaveBeenCalledWith(verifyError, {
      action: "verify-password-reset-code",
      code: "auth/invalid-action-code",
      message: "Firebase: Error (auth/invalid-action-code).",
    });

    await act(async () => {
      await result.current.confirm("oob-1", "new-pw");
    });
    expect(onError).toHaveBeenCalledWith(confirmError, {
      action: "confirm-password-reset",
      code: "auth/expired-action-code",
      message: "Firebase: Error (auth/expired-action-code).",
    });
  });
});
