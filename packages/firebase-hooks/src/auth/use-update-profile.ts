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
import {
  type HookErrorOptions,
  type HookResult,
  requireCurrentUser,
  useAuthArgs,
  useAuthTask,
} from "./_shared";

/** What `useUpdateProfile` returns. */
export type UseUpdateProfileResult = ReturnType<typeof useUpdateProfileBase>;

export function useUpdateProfile(options?: HookErrorOptions): UseUpdateProfileResult;
export function useUpdateProfile(
  auth: Auth | null,
  options?: HookErrorOptions,
): UseUpdateProfileResult;
export function useUpdateProfile(
  authOrOptions?: Auth | null | HookErrorOptions,
  maybeOptions?: HookErrorOptions,
) {
  return useUpdateProfileBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useUpdateProfileBase(auth: Auth | null, options: HookErrorOptions) {
  const { status, isIdle, isPending, isSuccess, isError, error, reset, run } =
    useAuthTask(options);

  const update = async (profile: {
    displayName?: string | null;
    photoURL?: string | null;
  }): Promise<HookResult> => {
    const result = await run("update-profile", "Failed to update profile", async () => {
      await updateProfile(requireCurrentUser(auth), profile);
      return {};
    });
    return result;
  };

  return { update, status, isIdle, isPending, isSuccess, isError, error, reset };
}
