import { act, renderHook } from "@testing-library/react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser, withAuthProvider } from "./_test-helpers.js";
import { usePhoneSignIn } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("usePhoneSignIn", () => {
  it("sends the code then confirms it, running onIdToken", async () => {
    const user = makeUser();
    const confirm = vi.fn(async () => ({ user }));
    vi.mocked(signInWithPhoneNumber).mockResolvedValue({ confirm } as never);
    const onIdToken = vi.fn();
    const { result } = renderHook(() => usePhoneSignIn(makeAuth(), { onIdToken }));

    await act(async () => {
      await result.current.sendCode("+2348012345678", "recaptcha-container");
    });
    expect(result.current.codeSent).toBe(true);

    await act(async () => {
      await result.current.confirmCode("123456");
    });
    expect(confirm).toHaveBeenCalledWith("123456");
    expect(onIdToken).toHaveBeenCalledWith("id-token-123", user);
  });

  it("confirmCode before sendCode fails with guidance", async () => {
    const { result } = renderHook(() => usePhoneSignIn(makeAuth()));
    await act(async () => {
      await result.current.confirmCode("123456");
    });
    expect(result.current.error).toMatch(/Send a verification code first/);
  });

  it("passes recaptchaSize to the verifier and clears it on unmount", async () => {
    vi.mocked(signInWithPhoneNumber).mockResolvedValue({ confirm: vi.fn() } as never);
    const { result, unmount } = renderHook(() =>
      usePhoneSignIn(makeAuth(), { recaptchaSize: "normal" }),
    );
    await act(async () => {
      await result.current.sendCode("+2348012345678", "recaptcha-container");
    });
    expect(RecaptchaVerifier).toHaveBeenCalledWith(
      expect.anything(),
      "recaptcha-container",
      { size: "normal" },
    );
    const verifier = vi.mocked(RecaptchaVerifier).mock.instances[0];
    unmount();
    expect(verifier?.clear).toHaveBeenCalledTimes(1);
  });

  it("defaults the reCAPTCHA to the invisible widget", async () => {
    vi.mocked(signInWithPhoneNumber).mockResolvedValue({ confirm: vi.fn() } as never);
    const { result } = renderHook(() => usePhoneSignIn(makeAuth()));
    await act(async () => {
      await result.current.sendCode("+2348012345678", "recaptcha-container");
    });
    expect(RecaptchaVerifier).toHaveBeenCalledWith(
      expect.anything(),
      "recaptcha-container",
      { size: "invisible" },
    );
  });

  it("an invalid number fails sendCode and codeSent stays false", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/invalid-phone-number",
      "Firebase: Error (auth/invalid-phone-number).",
    );
    vi.mocked(signInWithPhoneNumber).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => usePhoneSignIn(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.sendCode>> | undefined;
    await act(async () => {
      outcome = await result.current.sendCode("not-a-number", "recaptcha-container");
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/invalid-phone-number",
      cause: firebaseError,
    });
    expect(result.current.codeSent).toBe(false);
  });

  it("notifies onError with the flow-specific action ids — send vs confirm", async () => {
    const sendError = new FakeFirebaseError(
      "auth/too-many-requests",
      "Firebase: Error (auth/too-many-requests).",
    );
    const confirmError = new FakeFirebaseError(
      "auth/invalid-verification-code",
      "Firebase: Error (auth/invalid-verification-code).",
    );
    const onError = vi.fn();
    const wrapper = withAuthProvider({ auth: makeAuth(), onError });
    const { result } = renderHook(() => usePhoneSignIn(makeAuth()), { wrapper });

    vi.mocked(signInWithPhoneNumber).mockRejectedValueOnce(sendError);
    await act(async () => {
      await result.current.sendCode("+2348012345678", "recaptcha-container");
    });
    expect(onError).toHaveBeenCalledWith(sendError, {
      action: "send-phone-code",
      code: "auth/too-many-requests",
      message: "Firebase: Error (auth/too-many-requests).",
    });

    const confirm = vi.fn(async () => {
      throw confirmError;
    });
    vi.mocked(signInWithPhoneNumber).mockResolvedValueOnce({ confirm } as never);
    await act(async () => {
      await result.current.sendCode("+2348012345678", "recaptcha-container");
    });
    let outcome: Awaited<ReturnType<typeof result.current.confirmCode>> | undefined;
    await act(async () => {
      outcome = await result.current.confirmCode("000000");
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/invalid-verification-code",
      cause: confirmError,
    });
    expect(onError).toHaveBeenCalledWith(confirmError, {
      action: "confirm-phone-code",
      code: "auth/invalid-verification-code",
      message: "Firebase: Error (auth/invalid-verification-code).",
    });
  });
});
