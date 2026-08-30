import { act, renderHook } from "@testing-library/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAuth, makeUser } from "./_test-helpers.js";
import { useLogin } from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useLogin", () => {
  it("signs in, then hands the fresh ID token to onIdToken", async () => {
    const user = makeUser();
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user } as never);
    const onIdToken = vi.fn();
    const { result } = renderHook(() => useLogin(makeAuth(), { onIdToken }));

    let outcome: Awaited<ReturnType<typeof result.current.login>> | undefined;
    await act(async () => {
      outcome = await result.current.login("a@b.c", "pw");
    });
    expect(onIdToken).toHaveBeenCalledWith("id-token-123", user);
    expect(outcome).toMatchObject({ success: true, user });
    expect(result.current.error).toBe(null);
  });

  it("a throwing onIdToken aborts the flow and surfaces the error", async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: makeUser() } as never);
    const { result } = renderHook(() =>
      useLogin(makeAuth(), {
        onIdToken: () => {
          throw new Error("session mint failed");
        },
      }),
    );
    let outcome: Awaited<ReturnType<typeof result.current.login>> | undefined;
    await act(async () => {
      outcome = await result.current.login("a@b.c", "pw");
    });
    expect(outcome?.success).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it("fails cleanly while auth is still null", async () => {
    const { result } = renderHook(() => useLogin(null));
    let outcome: Awaited<ReturnType<typeof result.current.login>> | undefined;
    await act(async () => {
      outcome = await result.current.login("a@b.c", "pw");
    });
    expect(outcome?.success).toBe(false);
  });

  it("successes include the untouched UserCredential", async () => {
    const user = makeUser();
    const rawCredential = { user, providerId: "password", operationType: "signIn" };
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue(rawCredential as never);
    const { result } = renderHook(() => useLogin(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.login>> | undefined;
    await act(async () => {
      outcome = await result.current.login("a@b.c", "pw");
    });
    expect(outcome).toMatchObject({ success: true, user, credential: rawCredential });
  });
});
