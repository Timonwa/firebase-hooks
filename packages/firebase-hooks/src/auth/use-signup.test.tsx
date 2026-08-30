import { act, renderHook } from "@testing-library/react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser } from "./_test-helpers.js";
import { useSignup } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSignup", () => {
  it("creates the account, sets the profile, and sends the verification mail by default", async () => {
    const user = makeUser();
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user } as never);
    const { result } = renderHook(() => useSignup(makeAuth()));
    await act(async () => {
      await result.current.signup("a@b.c", "pw", { displayName: "Ada" });
    });
    expect(updateProfile).toHaveBeenCalledWith(user, { displayName: "Ada" });
    expect(sendEmailVerification).toHaveBeenCalledWith(user);
  });

  it("skips the verification mail when disabled", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: makeUser(),
    } as never);
    const { result } = renderHook(() =>
      useSignup(makeAuth(), { sendVerificationEmail: false }),
    );
    await act(async () => {
      await result.current.signup("a@b.c", "pw");
    });
    expect(sendEmailVerification).not.toHaveBeenCalled();
  });

  it("skips the profile write when no profile fields are given, and still mints the session", async () => {
    const user = makeUser();
    const rawCredential = { user, providerId: "password", operationType: "signIn" };
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(rawCredential as never);
    const onIdToken = vi.fn();
    const { result } = renderHook(() => useSignup(makeAuth(), { onIdToken }));
    let outcome: Awaited<ReturnType<typeof result.current.signup>> | undefined;
    await act(async () => {
      outcome = await result.current.signup("a@b.c", "pw");
    });
    expect(updateProfile).not.toHaveBeenCalled();
    expect(onIdToken).toHaveBeenCalledWith("id-token-123", user);
    expect(outcome).toMatchObject({ success: true, user, credential: rawCredential });
  });

  it("a taken email surfaces error, code, and cause", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/email-already-in-use",
      "Firebase: Error (auth/email-already-in-use).",
    );
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useSignup(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.signup>> | undefined;
    await act(async () => {
      outcome = await result.current.signup("a@b.c", "pw");
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/email-already-in-use",
      cause: firebaseError,
    });
    expect(result.current.error).toBe("Firebase: Error (auth/email-already-in-use).");
    expect(sendEmailVerification).not.toHaveBeenCalled();
  });
});
