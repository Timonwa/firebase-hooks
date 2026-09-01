// Provider state plus the cross-cutting behaviour every hook shares — the
// error model, formatter precedence, global config inheritance, and the
// onError observer — exercised through useLogin and friends as vehicles.
import { act, renderHook } from "@testing-library/react";
import {
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { formatFirebaseError } from "../core/index.js";
import {
  FakeFirebaseError,
  makeAuth,
  makeUser,
  withAuthProvider,
} from "./_test-helpers.js";
import {
  AUTH_ERROR_MESSAGES,
  useAuth,
  useLogin,
  useLogout,
  useSendPasswordResetEmail,
} from "./index.js";

vi.mock("firebase/auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AuthProvider / useAuth", () => {
  it("exposes the user and claims from onIdTokenChanged, and loading until the first callback", async () => {
    let listener: ((user: User | null) => void) | undefined;
    vi.mocked(onIdTokenChanged).mockImplementation((_auth, cb) => {
      listener = cb as (user: User | null) => void;
      return () => {};
    });
    const auth = makeAuth();
    const { result } = renderHook(() => useAuth(), {
      wrapper: withAuthProvider({ auth }),
    });
    expect(result.current.isLoading).toBe(true);

    await act(async () => listener?.(makeUser()));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.claims).toEqual({ isAdmin: true });

    await act(async () => listener?.(null));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.claims).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it("useAuth outside the provider throws the guidance error", () => {
    expect(() => renderHook(() => useAuth())).toThrow(/inside <AuthProvider>/);
  });
});

describe("error model", () => {
  it("failures carry error, code, and cause — raw never gated behind processing", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/invalid-credential",
      "Firebase: Error (auth/invalid-credential).",
    );
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(firebaseError);
    const { result } = renderHook(() => useLogin(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.login>> | undefined;
    await act(async () => {
      outcome = await result.current.login("a@b.c", "pw");
    });
    expect(outcome).toMatchObject({
      success: false,
      error: "Firebase: Error (auth/invalid-credential).", // raw by default
      code: "auth/invalid-credential",
      cause: firebaseError,
    });
  });

  it("a throwing formatter falls back to the raw message instead of losing the error", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error("real problem"));
    const { result } = renderHook(() =>
      useLogin(makeAuth(), {
        formatErrorMessage: () => {
          throw new Error("formatter bug");
        },
      }),
    );
    await act(async () => {
      await result.current.login("a@b.c", "pw");
    });
    expect(result.current.error).toBe("real problem");
  });

  it("loading is true while a task runs and resets after a failure", async () => {
    let rejectSignIn!: (error: unknown) => void;
    vi.mocked(signInWithEmailAndPassword).mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectSignIn = reject;
        }) as never,
    );
    const { result } = renderHook(() => useLogin(makeAuth()));
    let pending!: ReturnType<typeof result.current.login>;
    act(() => {
      pending = result.current.login("a@b.c", "pw");
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      rejectSignIn(new Error("boom"));
      await pending;
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("boom");
  });
});

describe("formatter precedence", () => {
  it("a hook-level formatErrorMessage applies", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() =>
      useLogin(makeAuth(), { formatErrorMessage: () => "Custom words" }),
    );
    await act(async () => {
      await result.current.login("a@b.c", "pw");
    });
    expect(result.current.error).toBe("Custom words");
  });

  it("the provider-level formatter applies, and a hook-level one overrides it", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error("boom"));
    const wrapper = withAuthProvider({
      auth: makeAuth(),
      formatErrorMessage: () => "from provider",
    });

    const viaProvider = renderHook(() => useLogin(makeAuth()), { wrapper });
    await act(async () => {
      await viaProvider.result.current.login("a@b.c", "pw");
    });
    expect(viaProvider.result.current.error).toBe("from provider");

    const viaHook = renderHook(
      () => useLogin(makeAuth(), { formatErrorMessage: () => "from hook" }),
      { wrapper },
    );
    await act(async () => {
      await viaHook.result.current.login("a@b.c", "pw");
    });
    expect(viaHook.result.current.error).toBe("from hook");
  });
});

describe("AUTH_ERROR_MESSAGES catalogue", () => {
  it("a mapped code returns the catalogue copy", () => {
    const err = new FakeFirebaseError(
      "auth/invalid-credential",
      "Firebase: Error (auth/invalid-credential).",
    );
    expect(formatFirebaseError(err, { messages: AUTH_ERROR_MESSAGES })).toBe(
      "Incorrect email or password.",
    );
  });
});

describe("global config on AuthProvider", () => {
  it("sign-in hooks inherit onIdToken from the provider; an explicit null opts out", async () => {
    const user = makeUser();
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user } as never);
    const globalOnIdToken = vi.fn();
    const wrapper = withAuthProvider({ auth: makeAuth(), onIdToken: globalOnIdToken });

    const inherited = renderHook(() => useLogin(makeAuth()), { wrapper });
    await act(async () => {
      await inherited.result.current.login("a@b.c", "pw");
    });
    expect(globalOnIdToken).toHaveBeenCalledWith("id-token-123", user);

    globalOnIdToken.mockClear();
    const optedOut = renderHook(() => useLogin(makeAuth(), { onIdToken: null }), {
      wrapper,
    });
    await act(async () => {
      await optedOut.result.current.login("a@b.c", "pw");
    });
    expect(globalOnIdToken).not.toHaveBeenCalled();
  });

  it("useLogout inherits onBeforeSignOut and keeps the server-first ordering", async () => {
    const globalClear = vi.fn(() => {
      throw new Error("server unreachable");
    });
    const wrapper = withAuthProvider({ auth: makeAuth(), onBeforeSignOut: globalClear });
    const { result } = renderHook(() => useLogout(makeAuth()), { wrapper });
    await act(async () => {
      await result.current.logout();
    });
    expect(globalClear).toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("actionCodeSettings flows from the provider into email sends", async () => {
    const settings = { url: "https://app/handler", handleCodeInApp: true };
    const wrapper = withAuthProvider({ auth: makeAuth(), actionCodeSettings: settings });
    const { result } = renderHook(() => useSendPasswordResetEmail(makeAuth()), {
      wrapper,
    });
    await act(async () => {
      await result.current.send("a@b.c");
    });
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      "a@b.c",
      settings,
    );
  });
});

describe("global onError observer", () => {
  it("fires with the raw error and { action, code, message } on every failure", async () => {
    const firebaseError = new FakeFirebaseError(
      "auth/too-many-requests",
      "Firebase: Error (auth/too-many-requests).",
    );
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(firebaseError);
    const onError = vi.fn();
    const wrapper = withAuthProvider({ auth: makeAuth(), onError });
    const { result } = renderHook(() => useLogin(makeAuth()), { wrapper });
    await act(async () => {
      await result.current.login("a@b.c", "pw");
    });
    expect(onError).toHaveBeenCalledWith(firebaseError, {
      action: "login",
      code: "auth/too-many-requests",
      message: "Firebase: Error (auth/too-many-requests).",
    });
  });

  it("a throwing observer never breaks or alters the flow", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error("real problem"));
    const wrapper = withAuthProvider({
      auth: makeAuth(),
      onError: () => {
        throw new Error("observer bug");
      },
    });
    const { result } = renderHook(() => useLogin(makeAuth()), { wrapper });
    let outcome: Awaited<ReturnType<typeof result.current.login>> | undefined;
    await act(async () => {
      outcome = await result.current.login("a@b.c", "pw");
    });
    expect(outcome).toMatchObject({ success: false, error: "real problem" });
    expect(result.current.error).toBe("real problem");
  });

  it("is not called on success", async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
      user: makeUser(),
    } as never);
    const onError = vi.fn();
    const wrapper = withAuthProvider({ auth: makeAuth(), onError });
    const { result } = renderHook(() => useLogin(makeAuth()), { wrapper });
    await act(async () => {
      await result.current.login("a@b.c", "pw");
    });
    expect(onError).not.toHaveBeenCalled();
  });
});

describe("auth argument resolution", () => {
  beforeEach(() => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
      user: makeUser(),
    } as never);
  });

  it("falls back to the provider's auth when the hook is called without one", async () => {
    const providerAuth = makeAuth();
    const wrapper = withAuthProvider({ auth: providerAuth });

    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      await result.current.login("a@b.c", "pw");
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(providerAuth, "a@b.c", "pw");
  });

  it("takes options as the only argument, still using the provider's auth", async () => {
    const providerAuth = makeAuth();
    const onIdToken = vi.fn();
    const wrapper = withAuthProvider({ auth: providerAuth });

    const { result } = renderHook(() => useLogin({ onIdToken }), { wrapper });
    await act(async () => {
      await result.current.login("a@b.c", "pw");
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(providerAuth, "a@b.c", "pw");
    expect(onIdToken).toHaveBeenCalled();
  });

  it("a hook's own auth wins over the provider's", async () => {
    const ownAuth = makeAuth();
    const wrapper = withAuthProvider({ auth: makeAuth() });

    const { result } = renderHook(() => useLogin(ownAuth), { wrapper });
    await act(async () => {
      await result.current.login("a@b.c", "pw");
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(ownAuth, "a@b.c", "pw");
  });

  it("an explicit null still means 'not ready', never 'inherit'", async () => {
    // The distinction that makes this safe: a consumer holding a hook back
    // during initialisation must not have the provider's auth substituted in.
    const wrapper = withAuthProvider({ auth: makeAuth() });

    const { result } = renderHook(() => useLogin(null), { wrapper });
    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.login("a@b.c", "pw");
    });

    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({ success: false });
  });

  it("works with no provider at all, given an auth", async () => {
    const ownAuth = makeAuth();
    const { result } = renderHook(() => useLogin(ownAuth));
    await act(async () => {
      await result.current.login("a@b.c", "pw");
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(ownAuth, "a@b.c", "pw");
  });

  it("fails cleanly with neither a provider nor an auth", async () => {
    const { result } = renderHook(() => useLogin());
    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.login("a@b.c", "pw");
    });

    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({ success: false });
  });
});
