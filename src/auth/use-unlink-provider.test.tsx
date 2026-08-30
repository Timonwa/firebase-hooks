import { act, renderHook } from "@testing-library/react";
import { unlink } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirebaseError, makeAuth, makeUser } from "./_test-helpers.js";
import { useUnlinkProvider } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useUnlinkProvider", () => {
  it("unlinks by provider id", async () => {
    const user = makeUser();
    vi.mocked(unlink).mockResolvedValue(user as never);
    const { result } = renderHook(() => useUnlinkProvider(makeAuth(user)));
    await act(async () => {
      await result.current.unlinkProvider("google.com");
    });
    expect(unlink).toHaveBeenCalledWith(user, "google.com");
  });

  it("resolves the updated user Firebase returns after the unlink", async () => {
    const updated = makeUser({ uid: "uid-1-after-unlink" });
    vi.mocked(unlink).mockResolvedValue(updated as never);
    const { result } = renderHook(() => useUnlinkProvider(makeAuth(makeUser())));
    let outcome: Awaited<ReturnType<typeof result.current.unlinkProvider>> | undefined;
    await act(async () => {
      outcome = await result.current.unlinkProvider("google.com");
    });
    expect(outcome).toMatchObject({ success: true, user: updated });
  });

  it("unlinking a provider the account doesn't have surfaces error, code, and cause", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/no-such-provider",
      "Firebase: Error (auth/no-such-provider).",
    );
    vi.mocked(unlink).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useUnlinkProvider(makeAuth(makeUser())));
    let outcome: Awaited<ReturnType<typeof result.current.unlinkProvider>> | undefined;
    await act(async () => {
      outcome = await result.current.unlinkProvider("github.com");
    });
    expect(outcome).toMatchObject({
      success: false,
      code: "auth/no-such-provider",
      cause: firebaseError,
    });
    expect(result.current.error).toBe("Firebase: Error (auth/no-such-provider).");
  });

  it("requires a signed-in user", async () => {
    const { result } = renderHook(() => useUnlinkProvider(makeAuth(null)));
    let outcome: Awaited<ReturnType<typeof result.current.unlinkProvider>> | undefined;
    await act(async () => {
      outcome = await result.current.unlinkProvider("google.com");
    });
    expect(outcome?.success).toBe(false);
    expect(result.current.error).toMatch(/No user is signed in/);
    expect(unlink).not.toHaveBeenCalled();
  });
});
