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
import {
  type HookErrorOptions,
  type HookResult,
  reauthenticateUserWithPassword,
  requireCurrentUser,
  useAuthArgs,
  useAuthTask,
  useResolvedConfig,
} from "./_shared";

export interface UseUpdateEmailOptions extends HookErrorOptions {
  /** Where the emailed link points back to. Overrides the provider; `null` opts out. */
  actionCodeSettings?: ActionCodeSettings | null;
}

/** What `useUpdateEmail` returns. */
export type UseUpdateEmailResult = ReturnType<typeof useUpdateEmailBase>;

export function useUpdateEmail(options?: UseUpdateEmailOptions): UseUpdateEmailResult;
export function useUpdateEmail(
  auth: Auth | null,
  options?: UseUpdateEmailOptions,
): UseUpdateEmailResult;
export function useUpdateEmail(
  authOrOptions?: Auth | null | UseUpdateEmailOptions,
  maybeOptions?: UseUpdateEmailOptions,
) {
  return useUpdateEmailBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useUpdateEmailBase(auth: Auth | null, options: UseUpdateEmailOptions) {
  const { status, isIdle, isPending, isSuccess, isError, error, reset, run } =
    useAuthTask(options);
  const actionCodeSettings = useResolvedConfig(
    "actionCodeSettings",
    options.actionCodeSettings,
  );

  // Shaped like the SDK's `verifyBeforeUpdateEmail(user, newEmail, …)` — the
  // required value leads, and the reauthentication this hook adds goes after.
  const update = async (
    newEmail: string,
    { currentPassword }: { currentPassword?: string } = {},
  ): Promise<HookResult> => {
    const result = await run("update-email", "Failed to update email", async () => {
      const user = requireCurrentUser(auth);
      if (currentPassword) await reauthenticateUserWithPassword(user, currentPassword);
      await verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);
      return {};
    });
    return result;
  };

  return { update, status, isIdle, isPending, isSuccess, isError, error, reset };
}
