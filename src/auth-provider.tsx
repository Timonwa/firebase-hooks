/**
 * @description Firebase auth state for the whole tree. Subscribes to
 * `onIdTokenChanged`, so `firebaseUser` and `claims` update on sign-in,
 * sign-out, AND token refreshes — custom-claim changes (roles) propagate
 * without a reload. `isLoading` is true only until the first callback, so
 * consumers can distinguish "signed out" from "not yet known".
 *
 * Also the home of package-wide defaults: `formatErrorMessage` (error
 * wording), `onIdToken` (session minting — every sign-in hook inherits it),
 * `onBeforeSignOut`, and `actionCodeSettings`. A hook's own option overrides
 * the global, an explicit `null` opts a single flow out, and every hook still
 * works with no provider at all. Server-fetched user records are an app
 * concern: layer them in your own provider on top of this one.
 *
 * @example
 * <AuthProvider
 *   auth={getFirebaseAuth()}
 *   onIdToken={(idToken) => createSession(idToken)}
 *   onBeforeSignOut={() => clearSession()}
 *   formatErrorMessage={(e) => formatFirebaseError(e, { messages: AUTH_ERROR_MESSAGES })}
 * >
 *   {children}
 * </AuthProvider>
 *
 * const { firebaseUser, claims, isAuthenticated, isLoading } = useAuth();
 * if (claims?.isAdmin) showAdminNav();
 */

"use client";

import { type ActionCodeSettings, type Auth, onIdTokenChanged, type User } from "firebase/auth";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { AuthConfigContext, type OnIdToken } from "./_shared";

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
  /** Package-wide default error wording; each hook's own option overrides it. */
  formatErrorMessage?: (error: unknown) => string;
  /** Package-wide session callback — every sign-in hook inherits it. */
  onIdToken?: OnIdToken;
  /** Package-wide server-session clearing for `useLogout`. */
  onBeforeSignOut?: () => void | Promise<void>;
  /** Package-wide default for every emailed link's landing settings. */
  actionCodeSettings?: ActionCodeSettings;
  children: ReactNode;
}

export function AuthProvider({
  auth,
  formatErrorMessage,
  onIdToken,
  onBeforeSignOut,
  actionCodeSettings,
  children,
}: AuthProviderProps) {
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

  const config = useMemo(
    () => ({ formatErrorMessage, onIdToken, onBeforeSignOut, actionCodeSettings }),
    [formatErrorMessage, onIdToken, onBeforeSignOut, actionCodeSettings],
  );

  return (
    <AuthConfigContext.Provider value={config}>
      <AuthContext.Provider
        value={{ firebaseUser, claims, isAuthenticated: firebaseUser !== null, isLoading }}
      >
        {children}
      </AuthContext.Provider>
    </AuthConfigContext.Provider>
  );
}

export function useAuth(): AuthContextValueProps {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
