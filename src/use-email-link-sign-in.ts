/**
 * @description Passwordless (magic link) sign-in. `sendLink` emails the
 * sign-in link and remembers the address in localStorage; `completeSignIn`
 * runs on the callback page and exchanges the link for a signed-in user. When
 * the address isn't in storage (link opened on another device), the result
 * carries `needsEmail: true` — render your own email-confirm input and call
 * `completeSignIn` again with the address; no `window.prompt`.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.actionCodeSettings - Where the emailed link lands (`url`, `handleCodeInApp: true`)
 * @param options.storageKey - localStorage key the address persists under (default: "emailForSignIn")
 * @param options.sendLink - Replace the client-side sender (e.g. your API emails the link instead)
 * @param options.onIdToken - Called with the ID token + user after sign-in
 * @returns `{ sendLink, completeSignIn, loading, error }`
 *
 * @example
 * // Request page
 * const { sendLink } = useEmailLinkSignIn(auth, {
 *   actionCodeSettings: { url: `${origin}/auth/callback`, handleCodeInApp: true },
 * });
 * await sendLink(email);
 *
 * @example
 * // Callback page
 * const { completeSignIn } = useEmailLinkSignIn(auth, { onIdToken: createSession });
 * const result = await completeSignIn(window.location.href);
 * if (!result.success && result.needsEmail) showEmailConfirmField();
 */

"use client";

import {
  type ActionCodeSettings,
  type Auth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  type User,
} from "firebase/auth";
import {
  type AuthErrorOptions,
  type AuthResult,
  type OnIdToken,
  requireAuth,
  runOnIdToken,
  useAuthTask,
} from "./_shared";

interface UseEmailLinkSignInOptionsProps extends AuthErrorOptions {
  actionCodeSettings?: ActionCodeSettings;
  storageKey?: string;
  sendLink?: (email: string) => Promise<void>;
  onIdToken?: OnIdToken;
}

type CompleteSignInResult =
  | { success: true; user: User }
  | { success: false; error: string; needsEmail?: boolean };

export function useEmailLinkSignIn(
  auth: Auth | null,
  options: UseEmailLinkSignInOptionsProps = {},
) {
  const { actionCodeSettings, storageKey = "emailForSignIn", onIdToken } = options;
  const { loading, error, setError, run } = useAuthTask(options);

  const sendLink = (email: string): Promise<AuthResult> =>
    run("Failed to send sign-in link", async () => {
      if (options.sendLink) {
        await options.sendLink(email);
      } else {
        if (!actionCodeSettings) {
          throw new Error(
            "actionCodeSettings is required when the hook sends the link itself",
          );
        }
        await sendSignInLinkToEmail(requireAuth(auth), email, actionCodeSettings);
      }
      try {
        window.localStorage.setItem(storageKey, email);
      } catch {
        /* storage unavailable — completeSignIn will ask for the email */
      }
      return {};
    });

  const completeSignIn = async (
    url: string,
    email?: string,
  ): Promise<CompleteSignInResult> => {
    let stored: string | null = email ?? null;
    if (!stored) {
      try {
        stored = window.localStorage.getItem(storageKey);
      } catch {
        stored = null;
      }
    }
    if (!stored) {
      // Not an error state worth showing — the caller renders an email-confirm input.
      return {
        success: false,
        needsEmail: true,
        error: "Email is required to complete sign-in",
      };
    }
    const confirmedEmail = stored;

    const result = await run("Failed to complete sign-in", async () => {
      const instance = requireAuth(auth);
      if (!isSignInWithEmailLink(instance, url)) throw new Error("Invalid sign-in link");
      const credential = await signInWithEmailLink(instance, confirmedEmail, url);
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        /* best-effort */
      }
      await runOnIdToken(onIdToken, credential.user);
      return { user: credential.user };
    });
    return result;
  };

  return { sendLink, completeSignIn, loading, error, setError };
}
