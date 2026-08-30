import { act, renderHook } from "@testing-library/react";
import { reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser } from "./_test-helpers.js";
import { useUpdatePassword } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useUpdatePassword", () => {
  it("reauthenticates BEFORE updating", async () => {
    const order: string[] = [];
    vi.mocked(reauthenticateWithCredential).mockImplementation(async () => {
      order.push("reauth");
      return undefined as never;
    });
    vi.mocked(updatePassword).mockImplementation(async () => void order.push("update"));
    const { result } = renderHook(() => useUpdatePassword(makeAuth(makeUser())));
    await act(async () => {
      await result.current.update({
        newPassword: "new-pw",
        currentPassword: "current-pw",
      });
    });
    expect(order).toEqual(["reauth", "update"]);
    expect(result.current.success).toBe(true);
  });

  it("skips reauthentication when currentPassword is omitted", async () => {
    const user = makeUser();
    const { result } = renderHook(() => useUpdatePassword(makeAuth(user)));
    await act(async () => {
      await result.current.update({ newPassword: "new-pw" });
    });
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
    expect(updatePassword).toHaveBeenCalledWith(user, "new-pw");
  });

  it("a stale session without currentPassword surfaces auth/requires-recent-login", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/requires-recent-login",
      "Firebase: Error (auth/requires-recent-login).",
    );
    vi.mocked(updatePassword).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useUpdatePassword(makeAuth(makeUser())));
    let outcome: Awaited<ReturnType<typeof result.current.update>> | undefined;
    await act(async () => {
      outcome = await result.current.update({ newPassword: "new-pw" });
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
    const { result } = renderHook(() => useUpdatePassword(makeAuth(user)));
    await act(async () => {
      await result.current.update({ newPassword: "new-pw", currentPassword: "old-pw" });
    });
    expect(result.current.error).toMatch(/no email\/password sign-in/);
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    const { result } = renderHook(() => useUpdatePassword(makeAuth(null)));
    let outcome: Awaited<ReturnType<typeof result.current.update>> | undefined;
    await act(async () => {
      outcome = await result.current.update({ newPassword: "new-pw" });
    });
    expect(outcome?.success).toBe(false);
    expect(result.current.error).toMatch(/No user is signed in/);
    expect(updatePassword).not.toHaveBeenCalled();
  });
});
