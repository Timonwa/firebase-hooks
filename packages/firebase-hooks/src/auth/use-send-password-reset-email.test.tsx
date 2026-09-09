import { act, renderHook } from "@testing-library/react";
import { sendPasswordResetEmail } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, withAuthProvider } from "./_test-helpers.js";
import { useSendPasswordResetEmail } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSendPasswordResetEmail", () => {
  it("flips success and resets", async () => {
    const { result } = renderHook(() => useSendPasswordResetEmail(makeAuth()));
    await act(async () => {
      await result.current.send("a@b.c");
    });
    expect(sendPasswordResetEmail).toHaveBeenCalled();
    expect(result.current.isSuccess).toBe(true);
    act(() => result.current.reset());
    expect(result.current.isSuccess).toBe(false);
  });

  it("hook-level actionCodeSettings wins over the provider default; null opts out", async () => {
    const globalSettings = { url: "https://app/global", handleCodeInApp: true };
    const hookSettings = { url: "https://app/hook", handleCodeInApp: true };
    const wrapper = withAuthProvider({
      auth: makeAuth(),
      actionCodeSettings: globalSettings,
    });

    const viaHook = renderHook(
      () => useSendPasswordResetEmail(makeAuth(), { actionCodeSettings: hookSettings }),
      { wrapper },
    );
    await act(async () => {
      await viaHook.result.current.send("a@b.c");
    });
    expect(sendPasswordResetEmail).toHaveBeenLastCalledWith(
      expect.anything(),
      "a@b.c",
      hookSettings,
    );

    const optedOut = renderHook(
      () => useSendPasswordResetEmail(makeAuth(), { actionCodeSettings: null }),
      { wrapper },
    );
    await act(async () => {
      await optedOut.result.current.send("a@b.c");
    });
    expect(sendPasswordResetEmail).toHaveBeenLastCalledWith(
      expect.anything(),
      "a@b.c",
      undefined,
    );
  });

  it("a failed send keeps success false and carries code and cause", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/invalid-email",
      "Firebase: Error (auth/invalid-email).",
    );
    vi.mocked(sendPasswordResetEmail).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useSendPasswordResetEmail(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.send>> | undefined;
    await act(async () => {
      outcome = await result.current.send("not-an-email");
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/invalid-email",
      cause: firebaseError,
    });
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe("Firebase: Error (auth/invalid-email).");
  });
});

describe("sendEmail", () => {
  it("delegates the send and never touches Firebase", async () => {
    const sendEmail = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useSendPasswordResetEmail(makeAuth(), { sendEmail }),
    );

    await act(async () => {
      await result.current.send("a@b.c");
    });

    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ email: "a@b.c" }));
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(result.current.isSuccess).toBe(true);
  });

  it("a throwing sender fails like any other error, leaving success false", async () => {
    const sendEmail = vi.fn(async () => {
      throw new Error("rate limited");
    });
    const { result } = renderHook(() =>
      useSendPasswordResetEmail(makeAuth(), { sendEmail }),
    );

    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.send("a@b.c");
    });

    expect(outcome).toMatchObject({ success: false, error: "rate limited" });
    expect(result.current.isSuccess).toBe(false);
  });

  it("needs no actionCodeSettings, since Firebase is not the sender", async () => {
    const sendEmail = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useSendPasswordResetEmail(makeAuth(), { sendEmail, actionCodeSettings: null }),
    );

    await act(async () => {
      await result.current.send("a@b.c");
    });

    expect(result.current.isSuccess).toBe(true);
  });
});
