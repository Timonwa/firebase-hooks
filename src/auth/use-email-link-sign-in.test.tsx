import { act, renderHook } from "@testing-library/react";
import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FakeFirebaseError,
  makeAuth,
  makeUser,
  stubLocalStorage,
  withAuthProvider,
} from "./_test-helpers.js";
import { useEmailLinkSignIn } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
  stubLocalStorage();
});

describe("useEmailLinkSignIn", () => {
  it("reports needsEmail when the address isn't stored, instead of prompting", async () => {
    const { result } = renderHook(() => useEmailLinkSignIn(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.completeSignIn>> | undefined;
    await act(async () => {
      outcome = await result.current.completeSignIn("https://app/cb?oobCode=x");
    });
    expect(outcome).toMatchObject({ success: false, needsEmail: true });
    expect(signInWithEmailLink).not.toHaveBeenCalled();
  });

  it("completes with the stored email and clears it after", async () => {
    window.localStorage.setItem("emailForSignIn", "a@b.c");
    const user = makeUser();
    vi.mocked(signInWithEmailLink).mockResolvedValue({ user } as never);
    const { result } = renderHook(() => useEmailLinkSignIn(makeAuth()));
    await act(async () => {
      await result.current.completeSignIn("https://app/cb?oobCode=x");
    });
    expect(signInWithEmailLink).toHaveBeenCalledWith(expect.anything(), "a@b.c", expect.any(String));
    expect(window.localStorage.getItem("emailForSignIn")).toBe(null);
  });

  it("sendLink without actionCodeSettings or a custom sender fails with guidance", async () => {
    const { result } = renderHook(() => useEmailLinkSignIn(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.sendLink>> | undefined;
    await act(async () => {
      outcome = await result.current.sendLink("a@b.c");
    });
    expect(outcome?.success).toBe(false);
    expect(result.current.error).toMatch(/actionCodeSettings/);
  });

  it("a custom sendLink replaces the client-side sender and stores under the custom key", async () => {
    const sendViaApi = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useEmailLinkSignIn(makeAuth(), { sendLink: sendViaApi, storageKey: "magic-email" }),
    );
    await act(async () => {
      await result.current.sendLink("a@b.c");
    });
    expect(sendViaApi).toHaveBeenCalledWith("a@b.c");
    expect(sendSignInLinkToEmail).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("magic-email")).toBe("a@b.c");
  });

  it("sendLink emails via Firebase with the hook's actionCodeSettings and stores the address", async () => {
    const settings = { url: "https://app/cb", handleCodeInApp: true };
    const { result } = renderHook(() =>
      useEmailLinkSignIn(makeAuth(), { actionCodeSettings: settings }),
    );
    let outcome: Awaited<ReturnType<typeof result.current.sendLink>> | undefined;
    await act(async () => {
      outcome = await result.current.sendLink("a@b.c");
    });
    expect(sendSignInLinkToEmail).toHaveBeenCalledWith(expect.anything(), "a@b.c", settings);
    expect(window.localStorage.getItem("emailForSignIn")).toBe("a@b.c");
    expect(outcome?.success).toBe(true);
  });

  it("an explicit null actionCodeSettings opts out of the provider default", async () => {
    const wrapper = withAuthProvider({
      auth: makeAuth(),
      actionCodeSettings: { url: "https://app/global", handleCodeInApp: true },
    });
    const { result } = renderHook(
      () => useEmailLinkSignIn(makeAuth(), { actionCodeSettings: null }),
      { wrapper },
    );
    let outcome: Awaited<ReturnType<typeof result.current.sendLink>> | undefined;
    await act(async () => {
      outcome = await result.current.sendLink("a@b.c");
    });
    expect(outcome?.success).toBe(false);
    expect(sendSignInLinkToEmail).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/actionCodeSettings/);
  });

  it("completeSignIn resolves user + credential and mints the session after sign-in", async () => {
    window.localStorage.setItem("emailForSignIn", "a@b.c");
    const user = makeUser();
    const rawCredential = { user, providerId: "password", operationType: "signIn" };
    vi.mocked(signInWithEmailLink).mockResolvedValue(rawCredential as never);
    const onIdToken = vi.fn();
    const { result } = renderHook(() => useEmailLinkSignIn(makeAuth(), { onIdToken }));
    let outcome: Awaited<ReturnType<typeof result.current.completeSignIn>> | undefined;
    await act(async () => {
      outcome = await result.current.completeSignIn("https://app/cb?oobCode=x");
    });
    expect(outcome).toMatchObject({ success: true, user, credential: rawCredential });
    expect(onIdToken).toHaveBeenCalledWith("id-token-123", user);
  });

  it("a URL that isn't a sign-in link fails with guidance", async () => {
    window.localStorage.setItem("emailForSignIn", "a@b.c");
    vi.mocked(isSignInWithEmailLink).mockReturnValueOnce(false);
    const { result } = renderHook(() => useEmailLinkSignIn(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.completeSignIn>> | undefined;
    await act(async () => {
      outcome = await result.current.completeSignIn("https://app/not-a-link");
    });
    expect(outcome?.success).toBe(false);
    expect(result.current.error).toMatch(/Invalid sign-in link/);
    expect(signInWithEmailLink).not.toHaveBeenCalled();
  });

  it("notifies onError with the flow-specific action ids — send vs complete", async () => {
    const sendError = new FakeFirebaseError(
      "auth/quota-exceeded",
      "Firebase: Error (auth/quota-exceeded).",
    );
    const completeError = new FakeFirebaseError(
      "auth/invalid-action-code",
      "Firebase: Error (auth/invalid-action-code).",
    );
    vi.mocked(sendSignInLinkToEmail).mockRejectedValue(sendError);
    vi.mocked(signInWithEmailLink).mockRejectedValue(completeError);
    window.localStorage.setItem("emailForSignIn", "a@b.c");
    const onError = vi.fn();
    const wrapper = withAuthProvider({ auth: makeAuth(), onError });
    const { result } = renderHook(
      () =>
        useEmailLinkSignIn(makeAuth(), {
          actionCodeSettings: { url: "https://app/cb", handleCodeInApp: true },
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.sendLink("a@b.c");
    });
    expect(onError).toHaveBeenCalledWith(sendError, {
      action: "send-sign-in-link",
      code: "auth/quota-exceeded",
      message: "Firebase: Error (auth/quota-exceeded).",
    });

    let outcome: Awaited<ReturnType<typeof result.current.completeSignIn>> | undefined;
    await act(async () => {
      outcome = await result.current.completeSignIn("https://app/cb?oobCode=x");
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/invalid-action-code",
      cause: completeError,
    });
    expect(onError).toHaveBeenCalledWith(completeError, {
      action: "email-link-sign-in",
      code: "auth/invalid-action-code",
      message: "Firebase: Error (auth/invalid-action-code).",
    });
  });

  it("an explicitly confirmed email wins over the stored one — the other-device flow", async () => {
    window.localStorage.setItem("emailForSignIn", "stored@b.c");
    vi.mocked(signInWithEmailLink).mockResolvedValue({ user: makeUser() } as never);
    const { result } = renderHook(() => useEmailLinkSignIn(makeAuth()));
    await act(async () => {
      await result.current.completeSignIn("https://app/cb?oobCode=x", "typed@b.c");
    });
    expect(signInWithEmailLink).toHaveBeenCalledWith(
      expect.anything(),
      "typed@b.c",
      expect.any(String),
    );
  });
});
