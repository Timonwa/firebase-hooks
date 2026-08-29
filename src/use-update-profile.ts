/**
 * @description Updates the signed-in user's display name and/or photo URL.
 * No reauthentication needed — Firebase treats profile fields as non-sensitive.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @returns `{ update, loading, error, success }`
 *
 * @example
 * const { update, loading } = useUpdateProfile(auth);
 * await update({ displayName: fullName, photoURL: avatarUrl });
 */

"use client";

import { type Auth, updateProfile } from "firebase/auth";
import { useState } from "react";
import {
  type AuthErrorOptions,
  type AuthResult,
  requireCurrentUser,
  useAuthTask,
} from "./_shared";

export function useUpdateProfile(auth: Auth | null, options: AuthErrorOptions = {}) {
  const { loading, error, run } = useAuthTask(options);
  const [success, setSuccess] = useState(false);

  const update = async (profile: {
    displayName?: string | null;
    photoURL?: string | null;
  }): Promise<AuthResult> => {
    setSuccess(false);
    const result = await run("Failed to update profile", async () => {
      await updateProfile(requireCurrentUser(auth), profile);
      return {};
    });
    if (result.success) setSuccess(true);
    return result;
  };

  return { update, loading, error, success };
}
