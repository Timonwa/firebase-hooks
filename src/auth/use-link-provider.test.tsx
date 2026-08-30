import { act, renderHook } from "@testing-library/react";
import { linkWithCredential, linkWithPopup } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser } from "./_test-helpers.js";
import { useLinkProvider } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useLinkProvider", () => {
  it("links via popup", async () => {
    const user = makeUser();
    vi.mocked(linkWithPopup).mockResolvedValue({ user } as never);
    const { result } = renderHook(() => useLinkProvider(makeAuth(user)));
    await act(async () => {
      await result.current.linkWithProvider({ providerId: "google.com" } as never);
    });
    expect(linkWithPopup).toHaveBeenCalled();
  });

  it("linkWithPassword builds an email/password credential for the current user", async () => {
    const guest = makeUser({ email: null, isAnonymous: true });
    const upgraded = makeUser({ email: "a@b.c" });
    const rawCredential = { user: upgraded, providerId: "password" };
    vi.mocked(linkWithCredential).mockResolvedValue(rawCredential as never);
    const { result } = renderHook(() => useLinkProvider(makeAuth(guest)));
    let outcome: Awaited<ReturnType<typeof result.current.linkWithPassword>> | undefined;
    await act(async () => {
      outcome = await result.current.linkWithPassword("a@b.c", "pw");
    });
    expect(linkWithCredential).toHaveBeenCalledWith(guest, {
      email: "a@b.c",
      password: "pw",
    });
    expect(outcome).toMatchObject({
      success: true,
      user: upgraded,
      credential: rawCredential,
    });
  });

  it("a credential already on another account surfaces error, code, and cause", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/credential-already-in-use",
      "Firebase: Error (auth/credential-already-in-use).",
    );
    vi.mocked(linkWithPopup).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useLinkProvider(makeAuth(makeUser())));
    let outcome: Awaited<ReturnType<typeof result.current.linkWithProvider>> | undefined;
    await act(async () => {
      outcome = await result.current.linkWithProvider({
        providerId: "google.com",
      } as never);
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/credential-already-in-use",
      cause: firebaseError,
    });
    expect(result.current.error).toBe("Firebase: Error (auth/credential-already-in-use).");
  });

  it("requires a signed-in user", async () => {
    const { result } = renderHook(() => useLinkProvider(makeAuth(null)));
    let outcome: Awaited<ReturnType<typeof result.current.linkWithPassword>> | undefined;
    await act(async () => {
      outcome = await result.current.linkWithPassword("a@b.c", "pw");
    });
    expect(outcome?.success).toBe(false);
    expect(result.current.error).toMatch(/No user is signed in/);
    expect(linkWithCredential).not.toHaveBeenCalled();
    expect(linkWithPopup).not.toHaveBeenCalled();
  });
});
