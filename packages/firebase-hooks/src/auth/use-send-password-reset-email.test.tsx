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
    expect(result.current.success).toBe(true);
    act(() => result.current.resetState());
    expect(result.current.success).toBe(false);
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
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe("Firebase: Error (auth/invalid-email).");
  });
});
