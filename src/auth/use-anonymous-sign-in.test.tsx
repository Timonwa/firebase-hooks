import { act, renderHook } from "@testing-library/react";
import { signInAnonymously } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser } from "./_test-helpers.js";
import { useAnonymousSignIn } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAnonymousSignIn", () => {
  it("anonymous sign-in resolves the user", async () => {
    const user = makeUser();
    vi.mocked(signInAnonymously).mockResolvedValue({ user } as never);
    const { result } = renderHook(() => useAnonymousSignIn(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.signIn>> | undefined;
    await act(async () => {
      outcome = await result.current.signIn();
    });
    expect(outcome).toMatchObject({ success: true, user });
  });

  it("hands the fresh ID token to onIdToken — guest sessions mint like any other", async () => {
    const user = makeUser();
    vi.mocked(signInAnonymously).mockResolvedValue({ user } as never);
    const onIdToken = vi.fn();
    const { result } = renderHook(() => useAnonymousSignIn(makeAuth(), { onIdToken }));
    await act(async () => {
      await result.current.signIn();
    });
    expect(onIdToken).toHaveBeenCalledWith("id-token-123", user);
  });

  it("a disabled sign-in method surfaces error, code, and cause", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/admin-restricted-operation",
      "Firebase: Error (auth/admin-restricted-operation).",
    );
    vi.mocked(signInAnonymously).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useAnonymousSignIn(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.signIn>> | undefined;
    await act(async () => {
      outcome = await result.current.signIn();
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/admin-restricted-operation",
      cause: firebaseError,
    });
    expect(result.current.error).toBe("Firebase: Error (auth/admin-restricted-operation).");
    expect(result.current.loading).toBe(false);
  });
});
