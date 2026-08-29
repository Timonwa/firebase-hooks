/**
 * @description Changes the signed-in user's email, with reauthentication built
 * in. Uses `verifyBeforeUpdateEmail`: Firebase mails a verification link to
 * the NEW address and the change only lands when it's clicked — so `success`
 * means "verification email sent", not "email changed".
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.actionCodeSettings - Where the emailed verification link lands
 * @returns `{ update, loading, error, success }`
 *
 * @example
 * const { update, success } = useUpdateEmail(auth);
 * await update(currentPassword, newEmail);
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
  type AuthErrorOptions,
  type AuthResult,
  reauthenticateUserWithPassword,
  requireCurrentUser,
  useAuthTask,
} from "./_shared";

interface UseUpdateEmailOptionsProps extends AuthErrorOptions {
  actionCodeSettings?: ActionCodeSettings;
}

export function useUpdateEmail(
  auth: Auth | null,
  options: UseUpdateEmailOptionsProps = {},
) {
  const { loading, error, run } = useAuthTask(options);
  const [success, setSuccess] = useState(false);

  const update = async (
    currentPassword: string,
    newEmail: string,
  ): Promise<AuthResult> => {
    setSuccess(false);
    const result = await run("Failed to update email", async () => {
      const user = requireCurrentUser(auth);
      await reauthenticateUserWithPassword(user, currentPassword);
      await verifyBeforeUpdateEmail(user, newEmail, options.actionCodeSettings);
      return {};
    });
    if (result.success) setSuccess(true);
    return result;
  };

  return { update, loading, error, success };
}
