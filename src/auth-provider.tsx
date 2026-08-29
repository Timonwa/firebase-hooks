/**
 * @description Firebase auth state for the whole tree. Subscribes to
 * `onIdTokenChanged`, so `firebaseUser` and `claims` update on sign-in,
 * sign-out, AND token refreshes — custom-claim changes (roles) propagate
 * without a reload. `isLoading` is true only until the first callback, so
 * consumers can distinguish "signed out" from "not yet known".
 *
 * Server-fetched user records are an app concern: layer them in your own
 * provider on top of this one.
 *
 * @example
 * <AuthProvider auth={getFirebaseAuth()}>{children}</AuthProvider>
 *
 * const { firebaseUser, claims, isAuthenticated, isLoading } = useAuth();
 * if (claims?.isAdmin) showAdminNav();
 */

"use client";

import { onIdTokenChanged, type Auth, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthContextValueProps {
  firebaseUser: User | null;
  /** Custom claims from the current ID token; null while signed out or loading. */
  claims: Record<string, unknown> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValueProps | undefined>(undefined);

interface AuthProviderProps {
  /** The Firebase `Auth` instance, or null while it initialises. */
  auth: Auth | null;
  children: ReactNode;
}

export function AuthProvider({ auth, children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        setFirebaseUser(null);
        setClaims(null);
        setIsLoading(false);
        return;
      }
      try {
        const tokenResult = await user.getIdTokenResult();
        setClaims(tokenResult.claims);
      } catch {
        setClaims(null);
      }
      setFirebaseUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider
      value={{ firebaseUser, claims, isAuthenticated: firebaseUser !== null, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValueProps {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
