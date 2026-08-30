'use client';

import {
  useAuth,
  useDeleteAccount,
  useLinkProvider,
  useReauthenticate,
  useSendEmailVerification,
  useUnlinkProvider,
  useUpdateEmail,
  useUpdatePassword,
  useUpdateProfile,
} from '@timonwa/firebase-hooks/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { useState } from 'react';
import { Button, DemoCard, Field, ResultView } from '@/components/demo-card';
import { useFirebase } from '@/components/firebase-provider';
import { NeedsConfig } from '@/components/needs-config';

export default function AccountPage() {
  const { auth, ready, config } = useFirebase();
  const { firebaseUser, claims, isAuthenticated, isLoading } = useAuth();

  if (ready && !config) return <NeedsConfig />;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Sensitive operations need a recent sign-in. Pass the current password and the
          hook reauthenticates first; omit it and{' '}
          <code className="font-mono">auth/requires-recent-login</code> reaches you.
        </p>
      </header>

      <DemoCard
        hook="useAuth"
        summary="Subscribes to onIdTokenChanged, so claims update on token refresh — a role change lands without a reload. isLoading distinguishes 'signed out' from 'not yet known'."
      >
        <ResultView
          result={{
            isLoading,
            isAuthenticated,
            claims,
            user: firebaseUser
              ? {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  emailVerified: firebaseUser.emailVerified,
                  displayName: firebaseUser.displayName,
                  isAnonymous: firebaseUser.isAnonymous,
                  providers: firebaseUser.providerData.map((p) => p.providerId),
                }
              : null,
          }}
        />
      </DemoCard>

      {!isLoading && !isAuthenticated ? (
        <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          Sign in first — the hooks below all act on the current user.
        </p>
      ) : null}

      <ProfileDemo auth={auth} />
      <VerificationDemo auth={auth} />
      <UpdateEmailDemo auth={auth} />
      <UpdatePasswordDemo auth={auth} />
      <ReauthenticateDemo auth={auth} />
      <LinkDemo auth={auth} />
      <UnlinkDemo auth={auth} />
      <DeleteDemo auth={auth} />
    </div>
  );
}

type WithAuth = { auth: Parameters<typeof useUpdateProfile>[0] };

function ProfileDemo({ auth }: WithAuth) {
  const { update, loading, error, success } = useUpdateProfile(auth);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useUpdateProfile"
      summary="Display name and photo URL. No reauthentication needed."
    >
      <Field
        label="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <Field
        label="Photo URL"
        value={photoURL}
        onChange={(e) => setPhotoURL(e.target.value)}
      />
      <Button
        disabled={loading}
        onClick={async () =>
          setResult(
            await update({
              ...(displayName && { displayName }),
              ...(photoURL && { photoURL }),
            }),
          )
        }
      >
        {loading ? 'Saving…' : 'Update profile'}
      </Button>
      {success ? <p className="text-sm text-green-600">Profile updated.</p> : null}
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function VerificationDemo({ auth }: WithAuth) {
  const { send, loading, error, success } = useSendEmailVerification(auth);
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useSendEmailVerification"
      summary="Re-sends the verification email. Pair with a cooldown in a real app — Firebase rate-limits these."
    >
      <Button disabled={loading} onClick={async () => setResult(await send())}>
        {loading ? 'Sending…' : 'Send verification email'}
      </Button>
      {success ? (
        <p className="text-sm text-green-600">Verification email sent.</p>
      ) : null}
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function UpdateEmailDemo({ auth }: WithAuth) {
  const { update, loading, error, success } = useUpdateEmail(auth);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useUpdateEmail"
      summary="Uses verifyBeforeUpdateEmail, so success means 'verification email sent' — not 'email changed'. It changes when the link is clicked."
    >
      <Field
        label="New email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
      />
      <Field
        label="Current password (omit for OAuth-only accounts)"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <Button
        disabled={loading}
        onClick={async () =>
          setResult(
            await update({ newEmail, ...(currentPassword && { currentPassword }) }),
          )
        }
      >
        {loading ? 'Sending…' : 'Update email'}
      </Button>
      {success ? (
        <p className="text-sm text-green-600">Check {newEmail} to confirm the change.</p>
      ) : null}
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function UpdatePasswordDemo({ auth }: WithAuth) {
  const { update, loading, error, success } = useUpdatePassword(auth);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useUpdatePassword"
      summary="Pass currentPassword and it reauthenticates first. Leave it blank to see auth/requires-recent-login on a stale session."
    >
      <Field
        label="New password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <Field
        label="Current password (optional)"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <Button
        disabled={loading}
        onClick={async () =>
          setResult(
            await update({ newPassword, ...(currentPassword && { currentPassword }) }),
          )
        }
      >
        {loading ? 'Saving…' : 'Update password'}
      </Button>
      {success ? <p className="text-sm text-green-600">Password updated.</p> : null}
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function ReauthenticateDemo({ auth }: WithAuth) {
  const { reauthenticateWithPassword, reauthenticateWithProvider, loading, error } =
    useReauthenticate(auth);
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useReauthenticate"
      summary="The recent-sign-in check on its own, for custom sensitive flows."
    >
      <Field
        label="Current password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={loading}
          onClick={async () => setResult(await reauthenticateWithPassword(password))}
        >
          With password
        </Button>
        <Button
          variant="secondary"
          disabled={loading}
          onClick={async () =>
            setResult(await reauthenticateWithProvider(new GoogleAuthProvider()))
          }
        >
          With Google
        </Button>
      </div>
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function LinkDemo({ auth }: WithAuth) {
  const { linkWithProvider, linkWithPassword, loading, error } = useLinkProvider(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useLinkProvider"
      summary="Adds a sign-in method. Sign in as a guest first, then link — the uid stays the same, so nothing they created is lost."
    >
      <Button
        disabled={loading}
        onClick={async () => setResult(await linkWithProvider(new GoogleAuthProvider()))}
      >
        Link Google
      </Button>
      <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        variant="secondary"
        disabled={loading}
        onClick={async () => setResult(await linkWithPassword(email, password))}
      >
        Link email and password
      </Button>
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function UnlinkDemo({ auth }: WithAuth) {
  const { unlinkProvider, loading, error } = useUnlinkProvider(auth);
  const [providerId, setProviderId] = useState('google.com');
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useUnlinkProvider"
      summary="Firebase refuses to unlink the last remaining method, so an account can't be locked out this way."
    >
      <Field
        label="Provider id"
        value={providerId}
        onChange={(e) => setProviderId(e.target.value)}
      />
      <Button
        variant="secondary"
        disabled={loading}
        onClick={async () => setResult(await unlinkProvider(providerId))}
      >
        Unlink
      </Button>
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function DeleteDemo({ auth }: WithAuth) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [cleanupRan, setCleanupRan] = useState(false);
  const [result, setResult] = useState<unknown>();
  const { deleteAccount, loading, error } = useDeleteAccount(auth, {
    // Runs while the user is still authenticated — the only moment security
    // rules will still let you delete their data.
    onBeforeDelete: () => setCleanupRan(true),
  });

  return (
    <DemoCard
      hook="useDeleteAccount"
      summary="onBeforeDelete runs first, while the user still exists. Throwing inside it aborts the deletion, so failed cleanup doesn't orphan records."
    >
      <Field
        label="Current password (optional)"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <Button
        variant="danger"
        disabled={loading}
        onClick={async () =>
          setResult(
            await deleteAccount(currentPassword ? { currentPassword } : undefined),
          )
        }
      >
        {loading ? 'Deleting…' : 'Delete account'}
      </Button>
      {cleanupRan ? (
        <p className="text-sm text-neutral-500">onBeforeDelete ran.</p>
      ) : null}
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}
