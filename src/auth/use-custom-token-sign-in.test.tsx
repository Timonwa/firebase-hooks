import { act, renderHook } from "@testing-library/react";
import { signInWithCustomToken } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser } from "./_test-helpers.js";
import { useCustomTokenSignIn } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useCustomTokenSignIn", () => {
  it("custom-token sign-in passes the token through", async () => {
    vi.mocked(signInWithCustomToken).mockResolvedValue({ user: makeUser() } as never);
    const { result } = renderHook(() => useCustomTokenSignIn(makeAuth()));
    await act(async () => {
      await result.current.signIn("custom-token");
    });
    expect(signInWithCustomToken).toHaveBeenCalledWith(expect.anything(), "custom-token");
  });

  it("resolves the untouched UserCredential and runs onIdToken — the server round-trip", async () => {
    const user = makeUser();
    const rawCredential = { user, providerId: null, operationType: "signIn" };
    vi.mocked(signInWithCustomToken).mockResolvedValue(rawCredential as never);
    const onIdToken = vi.fn();
    const { result } = renderHook(() => useCustomTokenSignIn(makeAuth(), { onIdToken }));
    let outcome: Awaited<ReturnType<typeof result.current.signIn>> | undefined;
    await act(async () => {
      outcome = await result.current.signIn("custom-token");
    });
    expect(outcome).toMatchObject({ success: true, user, credential: rawCredential });
    expect(onIdToken).toHaveBeenCalledWith("id-token-123", user);
  });

  it("a rejected token surfaces error, code, and cause", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/invalid-custom-token",
      "Firebase: Error (auth/invalid-custom-token).",
    );
    vi.mocked(signInWithCustomToken).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useCustomTokenSignIn(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.signIn>> | undefined;
    await act(async () => {
      outcome = await result.current.signIn("bad-token");
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/invalid-custom-token",
      cause: firebaseError,
    });
    expect(result.current.error).toBe("Firebase: Error (auth/invalid-custom-token).");
  });
});
