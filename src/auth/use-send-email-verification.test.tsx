import { act, renderHook } from "@testing-library/react";
import { sendEmailVerification } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser } from "./_test-helpers.js";
import { useSendEmailVerification } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSendEmailVerification", () => {
  it("requires a signed-in user", async () => {
    const { result } = renderHook(() => useSendEmailVerification(makeAuth(null)));
    await act(async () => {
      await result.current.send();
    });
    expect(result.current.error).toMatch(/No user is signed in/);
  });

  it("sends to the current user with the resolved actionCodeSettings and flips success", async () => {
    const user = makeUser();
    const settings = { url: "https://app/verified", handleCodeInApp: true };
    const { result } = renderHook(() =>
      useSendEmailVerification(makeAuth(user), { actionCodeSettings: settings }),
    );
    await act(async () => {
      await result.current.send();
    });
    expect(sendEmailVerification).toHaveBeenCalledWith(user, settings);
    expect(result.current.success).toBe(true);
  });

  it("a rate-limited resend keeps success false and carries code and cause", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/too-many-requests",
      "Firebase: Error (auth/too-many-requests).",
    );
    vi.mocked(sendEmailVerification).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useSendEmailVerification(makeAuth(makeUser())));
    let outcome: Awaited<ReturnType<typeof result.current.send>> | undefined;
    await act(async () => {
      outcome = await result.current.send();
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/too-many-requests",
      cause: firebaseError,
    });
    expect(result.current.success).toBe(false);
  });
});
