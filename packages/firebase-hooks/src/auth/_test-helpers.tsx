// Shared test fakes and builders for the auth test files. Test-only — never
// exported from the entry barrel, never shipped.
import type { Auth, User } from "firebase/auth";
import type { ComponentProps, ReactNode } from "react";
import { vi } from "vitest";
import { AuthProvider } from "./auth-provider.js";

export function makeUser(overrides: Partial<User> = {}): User {
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

export function makeAuth(currentUser: User | null = null): Auth {
  return { currentUser } as unknown as Auth;
}

// Node's experimental localStorage global shadows jsdom's — stub a real one.
export function stubLocalStorage() {
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

export class FakeFirebaseError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

type AuthProviderConfig = Omit<ComponentProps<typeof AuthProvider>, "children">;

/** renderHook `wrapper` builder — an AuthProvider carrying the given config. */
export function withAuthProvider(config: AuthProviderConfig) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider {...config}>{children}</AuthProvider>;
  };
}
