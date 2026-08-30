import { act, renderHook } from "@testing-library/react";
import { reauthenticateWithCredential, reauthenticateWithPopup } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser } from "./_test-helpers.js";
import { useReauthenticate } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useReauthenticate", () => {
  it("reauthenticates with a credential built from the account's own email", async () => {
    const user = makeUser();
    const { result } = renderHook(() => useReauthenticate(makeAuth(user)));
    let outcome:
      | Awaited<ReturnType<typeof result.current.reauthenticateWithPassword>>
      | undefined;
    await act(async () => {
      outcome = await result.current.reauthenticateWithPassword("current-pw");
    });
    expect(reauthenticateWithCredential).toHaveBeenCalledWith(user, {
      email: "user@example.com",
      password: "current-pw",
    });
    expect(outcome?.success).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it("a wrong password comes back as the standard failure shape", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/wrong-password",
      "Firebase: Error (auth/wrong-password).",
    );
    vi.mocked(reauthenticateWithCredential).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useReauthenticate(makeAuth(makeUser())));
    let outcome:
      | Awaited<ReturnType<typeof result.current.reauthenticateWithPassword>>
      | undefined;
    await act(async () => {
      outcome = await result.current.reauthenticateWithPassword("wrong-pw");
    });
    expect(outcome).toMatchObject({
      success: false,
      error: "Firebase: Error (auth/wrong-password).",
      code: "auth/wrong-password",
      cause: firebaseError,
    });
    expect(result.current.error).toBe("Firebase: Error (auth/wrong-password).");
  });

  it("an account with no email can't take the password path", async () => {
    const user = makeUser({ email: null });
    const { result } = renderHook(() => useReauthenticate(makeAuth(user)));
    await act(async () => {
      await result.current.reauthenticateWithPassword("current-pw");
    });
    expect(result.current.error).toMatch(/no email\/password sign-in/);
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    const { result } = renderHook(() => useReauthenticate(makeAuth(null)));
    let outcome:
      | Awaited<ReturnType<typeof result.current.reauthenticateWithPassword>>
      | undefined;
    await act(async () => {
      outcome = await result.current.reauthenticateWithPassword("current-pw");
    });
    expect(outcome?.success).toBe(false);
    expect(result.current.error).toMatch(/No user is signed in/);
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
  });

  it("OAuth-only accounts reauthenticate via the provider popup instead", async () => {
    const user = makeUser({ email: null });
    const provider = { providerId: "google.com" } as never;
    const { result } = renderHook(() => useReauthenticate(makeAuth(user)));
    let outcome:
      | Awaited<ReturnType<typeof result.current.reauthenticateWithProvider>>
      | undefined;
    await act(async () => {
      outcome = await result.current.reauthenticateWithProvider(provider);
    });
    expect(reauthenticateWithPopup).toHaveBeenCalledWith(user, provider);
    expect(outcome?.success).toBe(true);
  });
});
