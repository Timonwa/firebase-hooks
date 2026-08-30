import { act, renderHook } from "@testing-library/react";
import { updateProfile } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser } from "./_test-helpers.js";
import { useUpdateProfile } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useUpdateProfile", () => {
  it("updates the current user", async () => {
    const user = makeUser();
    const { result } = renderHook(() => useUpdateProfile(makeAuth(user)));
    await act(async () => {
      await result.current.update({ displayName: "Ada" });
    });
    expect(updateProfile).toHaveBeenCalledWith(user, { displayName: "Ada" });
    expect(result.current.success).toBe(true);
  });

  it("a failed update keeps success false and carries code and cause", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/network-request-failed",
      "Firebase: Error (auth/network-request-failed).",
    );
    vi.mocked(updateProfile).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useUpdateProfile(makeAuth(makeUser())));
    let outcome: Awaited<ReturnType<typeof result.current.update>> | undefined;
    await act(async () => {
      outcome = await result.current.update({ photoURL: "https://cdn/x.png" });
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/network-request-failed",
      cause: firebaseError,
    });
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe("Firebase: Error (auth/network-request-failed).");
  });

  it("requires a signed-in user", async () => {
    const { result } = renderHook(() => useUpdateProfile(makeAuth(null)));
    await act(async () => {
      await result.current.update({ displayName: "Ada" });
    });
    expect(result.current.error).toMatch(/No user is signed in/);
    expect(updateProfile).not.toHaveBeenCalled();
  });
});
