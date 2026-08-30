import { act, renderHook, waitFor } from "@testing-library/react";
import { getRedirectResult, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser, withAuthProvider } from "./_test-helpers.js";
import { useOAuthSignIn } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useOAuthSignIn", () => {
  it("popup sign-in runs onIdToken with the fresh token", async () => {
    const user = makeUser();
    vi.mocked(signInWithPopup).mockResolvedValue({ user } as never);
    const onIdToken = vi.fn();
    const { result } = renderHook(() => useOAuthSignIn(makeAuth(), { onIdToken }));
    await act(async () => {
      await result.current.signIn({ providerId: "google.com" } as never);
    });
    expect(onIdToken).toHaveBeenCalledWith("id-token-123", user);
  });

  it("completes a pending redirect on mount, exactly once across Strict Mode remounts", async () => {
    const user = makeUser();
    vi.mocked(getRedirectResult).mockResolvedValue({ user } as never);
    const onIdToken = vi.fn();
    renderHook(() => useOAuthSignIn(makeAuth(), { onIdToken }));
    await waitFor(() => expect(onIdToken).toHaveBeenCalledWith("id-token-123", user));
    expect(getRedirectResult).toHaveBeenCalledTimes(1);
  });

  it("method: \"redirect\" navigates away instead of opening the popup", async () => {
    const provider = { providerId: "google.com" } as never;
    const { result } = renderHook(() => useOAuthSignIn(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.signIn>> | undefined;
    await act(async () => {
      outcome = await result.current.signIn(provider, { method: "redirect" });
    });
    expect(signInWithRedirect).toHaveBeenCalledWith(expect.anything(), provider);
    expect(signInWithPopup).not.toHaveBeenCalled();
    // No user yet — the mount effect completes the flow after the round-trip.
    expect(outcome).toMatchObject({ success: true, user: null, credential: null });
  });

  it("a closed popup surfaces error, code, and cause", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/popup-closed-by-user",
      "Firebase: Error (auth/popup-closed-by-user).",
    );
    vi.mocked(signInWithPopup).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useOAuthSignIn(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.signIn>> | undefined;
    await act(async () => {
      outcome = await result.current.signIn({ providerId: "google.com" } as never);
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/popup-closed-by-user",
      cause: firebaseError,
    });
    expect(result.current.error).toBe("Firebase: Error (auth/popup-closed-by-user).");
  });

  it("notifies onError with the flow-specific action ids — oauth-redirect vs oauth-sign-in", async () => {
    const redirectError = new FakeFirebaseError(
      "auth/account-exists-with-different-credential",
      "Firebase: Error (auth/account-exists-with-different-credential).",
    );
    const popupError = new FakeFirebaseError(
      "auth/popup-blocked",
      "Firebase: Error (auth/popup-blocked).",
    );
    vi.mocked(getRedirectResult).mockRejectedValue(redirectError);
    vi.mocked(signInWithPopup).mockRejectedValue(popupError);
    const onError = vi.fn();
    const wrapper = withAuthProvider({ auth: makeAuth(), onError });
    const { result } = renderHook(() => useOAuthSignIn(makeAuth()), { wrapper });

    // The mount effect surfaces the failed redirect completion.
    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(redirectError, {
        action: "oauth-redirect",
        code: "auth/account-exists-with-different-credential",
        message: "Firebase: Error (auth/account-exists-with-different-credential).",
      }),
    );
    expect(result.current.error).toBe(
      "Firebase: Error (auth/account-exists-with-different-credential).",
    );

    await act(async () => {
      await result.current.signIn({ providerId: "google.com" } as never);
    });
    expect(onError).toHaveBeenCalledWith(popupError, {
      action: "oauth-sign-in",
      code: "auth/popup-blocked",
      message: "Firebase: Error (auth/popup-blocked).",
    });
  });
});
