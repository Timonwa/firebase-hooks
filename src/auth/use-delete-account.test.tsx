import { act, renderHook } from "@testing-library/react";
import { deleteUser, reauthenticateWithCredential } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser } from "./_test-helpers.js";
import { useDeleteAccount } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useDeleteAccount", () => {
  it("runs server cleanup before deleting; cleanup failure aborts", async () => {
    const user = makeUser();
    const { result } = renderHook(() =>
      useDeleteAccount(makeAuth(user), {
        onBeforeDelete: () => {
          throw new Error("cleanup failed");
        },
      }),
    );
    await act(async () => {
      await result.current.deleteAccount({ currentPassword: "pw" });
    });
    expect(reauthenticateWithCredential).toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("reauthenticates, then cleans up, then deletes — in that order", async () => {
    const order: string[] = [];
    vi.mocked(reauthenticateWithCredential).mockImplementation(async () => {
      order.push("reauth");
      return undefined as never;
    });
    vi.mocked(deleteUser).mockImplementation(async () => void order.push("delete"));
    const { result } = renderHook(() =>
      useDeleteAccount(makeAuth(makeUser()), {
        onBeforeDelete: () => void order.push("cleanup"),
      }),
    );
    let outcome: Awaited<ReturnType<typeof result.current.deleteAccount>> | undefined;
    await act(async () => {
      outcome = await result.current.deleteAccount({ currentPassword: "pw" });
    });
    expect(order).toEqual(["reauth", "cleanup", "delete"]);
    expect(outcome?.success).toBe(true);
  });

  it("without currentPassword a stale session surfaces auth/requires-recent-login", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/requires-recent-login",
      "Firebase: Error (auth/requires-recent-login).",
    );
    vi.mocked(deleteUser).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useDeleteAccount(makeAuth(makeUser())));
    let outcome: Awaited<ReturnType<typeof result.current.deleteAccount>> | undefined;
    await act(async () => {
      outcome = await result.current.deleteAccount();
    });
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/requires-recent-login",
      cause: firebaseError,
    });
  });

  it("a passwordless account can't take the currentPassword path", async () => {
    const user = makeUser({ email: null });
    const { result } = renderHook(() => useDeleteAccount(makeAuth(user)));
    await act(async () => {
      await result.current.deleteAccount({ currentPassword: "pw" });
    });
    expect(result.current.error).toMatch(/no email\/password sign-in/);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    const { result } = renderHook(() => useDeleteAccount(makeAuth(null)));
    let outcome: Awaited<ReturnType<typeof result.current.deleteAccount>> | undefined;
    await act(async () => {
      outcome = await result.current.deleteAccount();
    });
    expect(outcome?.success).toBe(false);
    expect(result.current.error).toMatch(/No user is signed in/);
    expect(deleteUser).not.toHaveBeenCalled();
  });
});
