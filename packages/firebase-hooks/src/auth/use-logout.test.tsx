import { act, renderHook } from "@testing-library/react";
import { signOut } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, withAuthProvider } from "./_test-helpers.js";
import { useLogout } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useLogout", () => {
  it("clears the server session FIRST; a failure there preserves the Firebase session", async () => {
    const { result } = renderHook(() =>
      useLogout(makeAuth(), {
        onBeforeSignOut: () => {
          throw new Error("server unreachable");
        },
      }),
    );
    let outcome: Awaited<ReturnType<typeof result.current.logout>> | undefined;
    await act(async () => {
      outcome = await result.current.logout();
    });
    expect(outcome?.success).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
  });

  it("signs out of Firebase after the server callback succeeds", async () => {
    const onBeforeSignOut = vi.fn();
    const { result } = renderHook(() => useLogout(makeAuth(), { onBeforeSignOut }));
    await act(async () => {
      await result.current.logout();
    });
    expect(onBeforeSignOut).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });

  it("an explicit null opts out of the provider's onBeforeSignOut", async () => {
    const globalClear = vi.fn();
    const wrapper = withAuthProvider({ auth: makeAuth(), onBeforeSignOut: globalClear });
    const { result } = renderHook(
      () => useLogout(makeAuth(), { onBeforeSignOut: null }),
      {
        wrapper,
      },
    );
    let outcome: Awaited<ReturnType<typeof result.current.logout>> | undefined;
    await act(async () => {
      outcome = await result.current.logout();
    });
    expect(globalClear).not.toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
    expect(outcome?.success).toBe(true);
  });

  it("a failed signOut surfaces error, code, and cause", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/network-request-failed",
      "Firebase: Error (auth/network-request-failed).",
    );
    vi.mocked(signOut).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useLogout(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.logout>> | undefined;
    await act(async () => {
      outcome = await result.current.logout();
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/network-request-failed",
      cause: firebaseError,
    });
    expect(result.current.error).toBe("Firebase: Error (auth/network-request-failed).");
  });
});
