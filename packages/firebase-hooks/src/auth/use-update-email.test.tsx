import { act, renderHook } from "@testing-library/react";
import { reauthenticateWithCredential, verifyBeforeUpdateEmail } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser } from "./_test-helpers.js";
import { useUpdateEmail } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useUpdateEmail", () => {
  it("reauthenticates BEFORE sending verify-before-update to the new address", async () => {
    const order: string[] = [];
    vi.mocked(reauthenticateWithCredential).mockImplementation(async () => {
      order.push("reauth");
      return undefined as never;
    });
    vi.mocked(verifyBeforeUpdateEmail).mockImplementation(
      async () => void order.push("verify"),
    );
    const user = makeUser();
    const { result } = renderHook(() => useUpdateEmail(makeAuth(user)));
    await act(async () => {
      await result.current.update("new@b.c", { currentPassword: "current-pw" });
    });
    expect(order).toEqual(["reauth", "verify"]);
    expect(verifyBeforeUpdateEmail).toHaveBeenCalledWith(user, "new@b.c", undefined);
    expect(result.current.success).toBe(true);
  });

  it("without currentPassword goes straight to verifyBeforeUpdateEmail", async () => {
    const user = makeUser();
    const { result } = renderHook(() => useUpdateEmail(makeAuth(user)));
    await act(async () => {
      await result.current.update("new@b.c");
    });
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
    expect(verifyBeforeUpdateEmail).toHaveBeenCalledWith(user, "new@b.c", undefined);
  });

  it("the resolved actionCodeSettings rides along with the verification email", async () => {
    const user = makeUser();
    const settings = { url: "https://app/email-updated", handleCodeInApp: true };
    const { result } = renderHook(() =>
      useUpdateEmail(makeAuth(user), { actionCodeSettings: settings }),
    );
    await act(async () => {
      await result.current.update("new@b.c");
    });
    expect(verifyBeforeUpdateEmail).toHaveBeenCalledWith(user, "new@b.c", settings);
  });

  it("a stale session without currentPassword surfaces auth/requires-recent-login", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/requires-recent-login",
      "Firebase: Error (auth/requires-recent-login).",
    );
    vi.mocked(verifyBeforeUpdateEmail).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useUpdateEmail(makeAuth(makeUser())));
    let outcome: Awaited<ReturnType<typeof result.current.update>> | undefined;
    await act(async () => {
      outcome = await result.current.update("new@b.c");
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/requires-recent-login",
      cause: firebaseError,
    });
    expect(result.current.success).toBe(false);
  });

  it("a passwordless account can't take the currentPassword path", async () => {
    const user = makeUser({ email: null });
    const { result } = renderHook(() => useUpdateEmail(makeAuth(user)));
    await act(async () => {
      await result.current.update("new@b.c", { currentPassword: "old-pw" });
    });
    expect(result.current.error).toMatch(/no email\/password sign-in/);
    expect(verifyBeforeUpdateEmail).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    const { result } = renderHook(() => useUpdateEmail(makeAuth(null)));
    let outcome: Awaited<ReturnType<typeof result.current.update>> | undefined;
    await act(async () => {
      outcome = await result.current.update("new@b.c");
    });
    expect(outcome?.success).toBe(false);
    expect(result.current.error).toMatch(/No user is signed in/);
    expect(verifyBeforeUpdateEmail).not.toHaveBeenCalled();
  });
});
