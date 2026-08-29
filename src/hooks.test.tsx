import { act, renderHook, waitFor } from "@testing-library/react";
import {
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  deleteUser,
  getRedirectResult,
  isSignInWithEmailLink,
  linkWithPopup,
  onIdTokenChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  unlink,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
  verifyPasswordResetCode,
  type Auth,
  type User,
} from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_ERROR_MESSAGES,
  AuthProvider,
  formatFirebaseError,
  getFirebaseErrorCode,
  useAnonymousSignIn,
  useAuth,
  useConfirmPasswordReset,
  useCustomTokenSignIn,
  useDeleteAccount,
  useEmailLinkSignIn,
  useLinkProvider,
  useLogin,
  useLogout,
  useOAuthSignIn,
  usePhoneSignIn,
  useSendEmailVerification,
  useSendPasswordResetEmail,
  useSignup,
  useUnlinkProvider,
  useUpdateEmail,
  useUpdatePassword,
  useUpdateProfile,
  useVerifyEmail,
} from "./index.js";

vi.mock("firebase/auth", () => ({
  applyActionCode: vi.fn(async () => {}),
  confirmPasswordReset: vi.fn(async () => {}),
  createUserWithEmailAndPassword: vi.fn(),
  deleteUser: vi.fn(async () => {}),
  EmailAuthProvider: { credential: vi.fn((email: string, password: string) => ({ email, password })) },
  getRedirectResult: vi.fn(async () => null),
  isSignInWithEmailLink: vi.fn(() => true),
  linkWithCredential: vi.fn(),
  linkWithPopup: vi.fn(),
  onIdTokenChanged: vi.fn(() => () => {}),
  reauthenticateWithCredential: vi.fn(async () => {}),
  reauthenticateWithPopup: vi.fn(async () => {}),
  RecaptchaVerifier: vi.fn(function RecaptchaVerifier(this: { clear: () => void }) {
    this.clear = vi.fn();
  }),
  sendEmailVerification: vi.fn(async () => {}),
  sendPasswordResetEmail: vi.fn(async () => {}),
  sendSignInLinkToEmail: vi.fn(async () => {}),
  signInAnonymously: vi.fn(),
  signInWithCustomToken: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithEmailLink: vi.fn(),
  signInWithPhoneNumber: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(async () => {}),
  signOut: vi.fn(async () => {}),
  unlink: vi.fn(),
  updatePassword: vi.fn(async () => {}),
  updateProfile: vi.fn(async () => {}),
  verifyBeforeUpdateEmail: vi.fn(async () => {}),
  verifyPasswordResetCode: vi.fn(async () => "user@example.com"),
}));

function makeUser(overrides: Partial<User> = {}): User {
  return {
    uid: "uid-1",
    email: "user@example.com",
    emailVerified: false,
    getIdToken: vi.fn(async () => "id-token-123"),
    getIdTokenResult: vi.fn(async () => ({ claims: { isAdmin: true } })),
    reload: vi.fn(async () => {}),
    ...overrides,
  } as unknown as User;
}

function makeAuth(currentUser: User | null = null): Auth {
  return { currentUser } as unknown as Auth;
}

// Node's experimental localStorage global shadows jsdom's — stub a real one.
function stubLocalStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  stubLocalStorage();
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
      wrapper: ({ children }) => <AuthProvider auth={auth}>{children}</AuthProvider>,
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

  it("respects a custom formatErrorMessage", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() =>
      useLogin(makeAuth(), { formatErrorMessage: () => "Custom words" }),
    );
    await act(async () => {
      await result.current.login("a@b.c", "pw");
    });
    expect(result.current.error).toBe("Custom words");
  });

  it("fails cleanly while auth is still null", async () => {
    const { result } = renderHook(() => useLogin(null));
    let outcome: Awaited<ReturnType<typeof result.current.login>> | undefined;
    await act(async () => {
      outcome = await result.current.login("a@b.c", "pw");
    });
    expect(outcome?.success).toBe(false);
  });
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
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: makeUser() } as never);
    const { result } = renderHook(() => useSignup(makeAuth(), { sendVerificationEmail: false }));
    await act(async () => {
      await result.current.signup("a@b.c", "pw");
    });
    expect(sendEmailVerification).not.toHaveBeenCalled();
  });
});

describe("useLogout", () => {
  it("clears the server session FIRST; a failure there preserves the Firebase session", async () => {
    const { result } = renderHook(() =>
      useLogout(makeAuth(), {
        onBeforeSignOut: () => {
          throw new Error("server unreachable");
        },
      }),
    );
    let outcome: Awaited<ReturnType<typeof result.current.logout>> | undefined;
    await act(async () => {
      outcome = await result.current.logout();
    });
    expect(outcome?.success).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
  });

  it("signs out of Firebase after the server callback succeeds", async () => {
    const onBeforeSignOut = vi.fn();
    const { result } = renderHook(() => useLogout(makeAuth(), { onBeforeSignOut }));
    await act(async () => {
      await result.current.logout();
    });
    expect(onBeforeSignOut).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });
});

describe("useOAuthSignIn", () => {
  it("popup sign-in runs onIdToken with the fresh token", async () => {
    const user = makeUser();
    vi.mocked(signInWithPopup).mockResolvedValue({ user } as never);
    const onIdToken = vi.fn();
    const { result } = renderHook(() => useOAuthSignIn(makeAuth(), { onIdToken }));
    await act(async () => {
      await result.current.signIn({ providerId: "google.com" } as never);
    });
    expect(onIdToken).toHaveBeenCalledWith("id-token-123", user);
  });

  it("completes a pending redirect on mount, exactly once across Strict Mode remounts", async () => {
    const user = makeUser();
    vi.mocked(getRedirectResult).mockResolvedValue({ user } as never);
    const onIdToken = vi.fn();
    renderHook(() => useOAuthSignIn(makeAuth(), { onIdToken }));
    await waitFor(() => expect(onIdToken).toHaveBeenCalledWith("id-token-123", user));
    expect(getRedirectResult).toHaveBeenCalledTimes(1);
  });
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
});

describe("useAnonymousSignIn / useCustomTokenSignIn", () => {
  it("anonymous sign-in resolves the user", async () => {
    const user = makeUser();
    vi.mocked(signInAnonymously).mockResolvedValue({ user } as never);
    const { result } = renderHook(() => useAnonymousSignIn(makeAuth()));
    let outcome: Awaited<ReturnType<typeof result.current.signIn>> | undefined;
    await act(async () => {
      outcome = await result.current.signIn();
    });
    expect(outcome).toMatchObject({ success: true, user });
  });

  it("custom-token sign-in passes the token through", async () => {
    vi.mocked(signInWithCustomToken).mockResolvedValue({ user: makeUser() } as never);
    const { result } = renderHook(() => useCustomTokenSignIn(makeAuth()));
    await act(async () => {
      await result.current.signIn("custom-token");
    });
    expect(signInWithCustomToken).toHaveBeenCalledWith(expect.anything(), "custom-token");
  });
});

describe("password flows", () => {
  it("useSendPasswordResetEmail flips success and resets", async () => {
    const { result } = renderHook(() => useSendPasswordResetEmail(makeAuth()));
    await act(async () => {
      await result.current.send("a@b.c");
    });
    expect(sendPasswordResetEmail).toHaveBeenCalled();
    expect(result.current.success).toBe(true);
    act(() => result.current.resetState());
    expect(result.current.success).toBe(false);
  });

  it("useConfirmPasswordReset verifies the code (returning the email) and confirms", async () => {
    const { result } = renderHook(() => useConfirmPasswordReset(makeAuth()));
    let check: Awaited<ReturnType<typeof result.current.verifyCode>> | undefined;
    await act(async () => {
      check = await result.current.verifyCode("oob-1");
    });
    expect(check).toMatchObject({ success: true, email: "user@example.com" });

    await act(async () => {
      await result.current.confirm("oob-1", "new-pw");
    });
    expect(confirmPasswordReset).toHaveBeenCalledWith(expect.anything(), "oob-1", "new-pw");
    expect(result.current.success).toBe(true);
  });

  it("useUpdatePassword reauthenticates BEFORE updating", async () => {
    const order: string[] = [];
    vi.mocked(reauthenticateWithCredential).mockImplementation(async () => {
      order.push("reauth");
      return undefined as never;
    });
    vi.mocked(updatePassword).mockImplementation(async () => void order.push("update"));
    const { result } = renderHook(() => useUpdatePassword(makeAuth(makeUser())));
    await act(async () => {
      await result.current.update({ newPassword: "new-pw", currentPassword: "current-pw" });
    });
    expect(order).toEqual(["reauth", "update"]);
    expect(result.current.success).toBe(true);
  });
});

describe("email flows", () => {
  it("useVerifyEmail applies the code once (Strict Mode safe) and reports success", async () => {
    const onVerified = vi.fn();
    const { result } = renderHook(() => useVerifyEmail(makeAuth(), "oob-1", { onVerified }));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(applyActionCode).toHaveBeenCalledTimes(1);
    expect(onVerified).toHaveBeenCalled();
  });

  it("useVerifyEmail fails fast on a missing code", () => {
    const { result } = renderHook(() => useVerifyEmail(makeAuth(), null));
    expect(result.current.status).toBe("failed");
    expect(result.current.error).toMatch(/missing/i);
  });

  it("useSendEmailVerification requires a signed-in user", async () => {
    const { result } = renderHook(() => useSendEmailVerification(makeAuth(null)));
    await act(async () => {
      await result.current.send();
    });
    expect(result.current.error).toMatch(/No user is signed in/);
  });

  it("useUpdateEmail reauthenticates, then sends verify-before-update to the new address", async () => {
    const user = makeUser();
    const { result } = renderHook(() => useUpdateEmail(makeAuth(user)));
    await act(async () => {
      await result.current.update({ newEmail: "new@b.c", currentPassword: "current-pw" });
    });
    expect(reauthenticateWithCredential).toHaveBeenCalled();
    expect(verifyBeforeUpdateEmail).toHaveBeenCalledWith(user, "new@b.c", undefined);
    expect(result.current.success).toBe(true);
  });
});

describe("account and linking", () => {
  it("useUpdateProfile updates the current user", async () => {
    const user = makeUser();
    const { result } = renderHook(() => useUpdateProfile(makeAuth(user)));
    await act(async () => {
      await result.current.update({ displayName: "Ada" });
    });
    expect(updateProfile).toHaveBeenCalledWith(user, { displayName: "Ada" });
  });

  it("useDeleteAccount runs server cleanup before deleting; cleanup failure aborts", async () => {
    const user = makeUser();
    const { result } = renderHook(() =>
      useDeleteAccount(makeAuth(user), {
        onBeforeDelete: () => {
          throw new Error("cleanup failed");
        },
      }),
    );
    await act(async () => {
      await result.current.deleteAccount({ currentPassword: "pw" });
    });
    expect(reauthenticateWithCredential).toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("useLinkProvider links via popup; useUnlinkProvider unlinks by provider id", async () => {
    const user = makeUser();
    vi.mocked(linkWithPopup).mockResolvedValue({ user } as never);
    vi.mocked(unlink).mockResolvedValue(user as never);

    const link = renderHook(() => useLinkProvider(makeAuth(user)));
    await act(async () => {
      await link.result.current.linkWithProvider({ providerId: "google.com" } as never);
    });
    expect(linkWithPopup).toHaveBeenCalled();

    const unlinkHook = renderHook(() => useUnlinkProvider(makeAuth(user)));
    await act(async () => {
      await unlinkHook.result.current.unlinkProvider("google.com");
    });
    expect(unlink).toHaveBeenCalledWith(user, "google.com");
  });
});

class FakeFirebaseError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

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

  it("the provider-level formatter applies, and a hook-level one overrides it", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error("boom"));
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider auth={makeAuth()} formatErrorMessage={() => "from provider"}>
        {children}
      </AuthProvider>
    );

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

describe("formatFirebaseError / getFirebaseErrorCode / AUTH_ERROR_MESSAGES", () => {
  it("a mapped code returns the catalogue copy", () => {
    const err = new FakeFirebaseError("auth/invalid-credential", "Firebase: Error (auth/invalid-credential).");
    expect(formatFirebaseError(err, { messages: AUTH_ERROR_MESSAGES })).toBe(
      "Incorrect email or password.",
    );
  });

  it("an unmapped Firebase error gets Firebase's own words, cleaned", () => {
    const err = new FakeFirebaseError(
      "auth/some-new-code",
      "Firebase: The thing went sideways. (auth/some-new-code).",
    );
    expect(formatFirebaseError(err)).toBe("The thing went sideways.");
  });

  it("a message with no usable words falls back to the code itself", () => {
    const err = new FakeFirebaseError("auth/mystery", "Firebase: Error (auth/mystery).");
    expect(formatFirebaseError(err)).toBe("auth/mystery");
  });

  it("non-Firebase errors pass through raw — no envelope unwrapping", () => {
    expect(formatFirebaseError(new Error("my server said no"))).toBe("my server said no");
    expect(formatFirebaseError("plain string")).toBe("plain string");
    expect(formatFirebaseError({ weird: true }, { fallback: "Fallback." })).toBe("Fallback.");
  });

  it("getFirebaseErrorCode extracts codes and returns null otherwise", () => {
    expect(getFirebaseErrorCode(new FakeFirebaseError("storage/object-not-found", "x"))).toBe(
      "storage/object-not-found",
    );
    expect(getFirebaseErrorCode(new Error("no code"))).toBe(null);
  });
});

describe("optional currentPassword", () => {
  it("useUpdatePassword skips reauthentication when currentPassword is omitted", async () => {
    const user = makeUser();
    const { result } = renderHook(() => useUpdatePassword(makeAuth(user)));
    await act(async () => {
      await result.current.update({ newPassword: "new-pw" });
    });
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
    expect(updatePassword).toHaveBeenCalledWith(user, "new-pw");
  });

  it("useUpdateEmail without currentPassword goes straight to verifyBeforeUpdateEmail", async () => {
    const user = makeUser();
    const { result } = renderHook(() => useUpdateEmail(makeAuth(user)));
    await act(async () => {
      await result.current.update({ newEmail: "new@b.c" });
    });
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
    expect(verifyBeforeUpdateEmail).toHaveBeenCalledWith(user, "new@b.c", undefined);
  });
});

describe("raw wrapper access", () => {
  it("sign-in successes include the untouched UserCredential", async () => {
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

describe("global config on AuthProvider", () => {
  it("sign-in hooks inherit onIdToken from the provider; an explicit null opts out", async () => {
    const user = makeUser();
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user } as never);
    const globalOnIdToken = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider auth={makeAuth()} onIdToken={globalOnIdToken}>
        {children}
      </AuthProvider>
    );

    const inherited = renderHook(() => useLogin(makeAuth()), { wrapper });
    await act(async () => {
      await inherited.result.current.login("a@b.c", "pw");
    });
    expect(globalOnIdToken).toHaveBeenCalledWith("id-token-123", user);

    globalOnIdToken.mockClear();
    const optedOut = renderHook(() => useLogin(makeAuth(), { onIdToken: null }), { wrapper });
    await act(async () => {
      await optedOut.result.current.login("a@b.c", "pw");
    });
    expect(globalOnIdToken).not.toHaveBeenCalled();
  });

  it("useLogout inherits onBeforeSignOut and keeps the server-first ordering", async () => {
    const globalClear = vi.fn(() => {
      throw new Error("server unreachable");
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider auth={makeAuth()} onBeforeSignOut={globalClear}>
        {children}
      </AuthProvider>
    );
    const { result } = renderHook(() => useLogout(makeAuth()), { wrapper });
    await act(async () => {
      await result.current.logout();
    });
    expect(globalClear).toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("actionCodeSettings flows from the provider into email sends", async () => {
    const settings = { url: "https://app/handler", handleCodeInApp: true };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider auth={makeAuth()} actionCodeSettings={settings}>
        {children}
      </AuthProvider>
    );
    const { result } = renderHook(() => useSendPasswordResetEmail(makeAuth()), { wrapper });
    await act(async () => {
      await result.current.send("a@b.c");
    });
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), "a@b.c", settings);
  });
});
