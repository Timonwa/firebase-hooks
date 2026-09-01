/**
 * @description Changes the signed-in user's email via `verifyBeforeUpdateEmail`:
 * Firebase mails a verification link to the NEW address and the change only
 * lands when it's clicked — so `success` means "verification email sent", not
 * "email changed". Pass `currentPassword` and the hook reauthenticates
 * automatically first; omit it (OAuth-only accounts have no password) and a
 * stale session surfaces `auth/requires-recent-login` through `code`/`cause`
 * — reauthenticate via `useReauthenticate` and retry.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.actionCodeSettings - Where the emailed verification link lands
 * @returns `{ update, loading, error, success }`
 *
 * @example
 * const { update, success } = useUpdateEmail();
 * await update(newEmail, { currentPassword }); // password account
 * await update(newEmail);                      // OAuth account — reauth handled by you
 * {success && <p>Check {newEmail} to confirm the change.</p>}
 */

"use client";

import {
  type ActionCodeSettings,
  type Auth,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { useState } from "react";
import {
  type HookErrorOptions,
  type HookResult,
  reauthenticateUserWithPassword,
  requireCurrentUser,
  useAuthArgs,
  useAuthTask,
  useResolvedConfig,
} from "./_shared";

export interface UseUpdateEmailOptionsProps extends HookErrorOptions {
  /** Where the emailed link points back to. Overrides the provider; `null` opts out. */
  actionCodeSettings?: ActionCodeSettings | null;
}

export function useUpdateEmail(
  options?: UseUpdateEmailOptionsProps,
): ReturnType<typeof useUpdateEmailBase>;
export function useUpdateEmail(
  auth: Auth | null,
  options?: UseUpdateEmailOptionsProps,
): ReturnType<typeof useUpdateEmailBase>;
export function useUpdateEmail(
  authOrOptions?: Auth | null | UseUpdateEmailOptionsProps,
  maybeOptions?: UseUpdateEmailOptionsProps,
) {
  return useUpdateEmailBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useUpdateEmailBase(auth: Auth | null, options: UseUpdateEmailOptionsProps) {
  const { loading, error, run } = useAuthTask(options);
  const actionCodeSettings = useResolvedConfig(
    "actionCodeSettings",
    options.actionCodeSettings,
  );
  const [success, setSuccess] = useState(false);

  // Shaped like the SDK's `verifyBeforeUpdateEmail(user, newEmail, …)` — the
  // required value leads, and the reauthentication this hook adds goes after.
  const update = async (
    newEmail: string,
    { currentPassword }: { currentPassword?: string } = {},
  ): Promise<HookResult> => {
    setSuccess(false);
    const result = await run("update-email", "Failed to update email", async () => {
      const user = requireCurrentUser(auth);
      if (currentPassword) await reauthenticateUserWithPassword(user, currentPassword);
      await verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);
      return {};
    });
    if (result.success) setSuccess(true);
    return result;
  };

  return { update, loading, error, success };
}
