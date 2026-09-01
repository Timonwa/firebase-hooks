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
  type HookErrorOptions,
  type HookResult,
  requireCurrentUser,
  useAuthArgs,
  useAuthTask,
} from "./_shared";

export function useUpdateProfile(
  options?: HookErrorOptions,
): ReturnType<typeof useUpdateProfileBase>;
export function useUpdateProfile(
  auth: Auth | null,
  options?: HookErrorOptions,
): ReturnType<typeof useUpdateProfileBase>;
export function useUpdateProfile(
  authOrOptions?: Auth | null | HookErrorOptions,
  maybeOptions?: HookErrorOptions,
) {
  return useUpdateProfileBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useUpdateProfileBase(auth: Auth | null, options: HookErrorOptions) {
  const { loading, error, run } = useAuthTask(options);
  const [success, setSuccess] = useState(false);

  const update = async (profile: {
    displayName?: string | null;
    photoURL?: string | null;
  }): Promise<HookResult> => {
    setSuccess(false);
    const result = await run("update-profile", "Failed to update profile", async () => {
      await updateProfile(requireCurrentUser(auth), profile);
      return {};
    });
    if (result.success) setSuccess(true);
    return result;
  };

  return { update, loading, error, success };
}
