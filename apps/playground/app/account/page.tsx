'use client';

import {
  useAuth,
  useDeleteAccount,
  useLinkProvider,
  useReauthenticate,
  useUnlinkProvider,
  useUpdateProfile,
} from '@timonwa/firebase-hooks/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import { hookSnippet, useErrorFormat, useFlowCallback } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';
import { NeedsConfig } from '@/components/needs-config';
import { PageIntro } from '@/components/page-intro';

export default function AccountPage() {
  const { auth, config } = useFirebase();
  if (!config) return <NeedsConfig />;

  return (
    <>
      <PageIntro
        title="Account and linking"
        lead="Everything that acts on the account someone is already signed in to — reading it, editing it, proving it's still them, and closing it."
      />
      <AuthState />
      <Profile auth={auth} />
      <Reauthenticate auth={auth} />
      <Link auth={auth} />
      <Unlink auth={auth} />
      <DeleteAccount auth={auth} />
    </>
  );
}

type WithAuth = { auth: Parameters<typeof useUpdateProfile>[0] };

function AuthState() {
  const { firebaseUser, claims, isAuthenticated, isLoading } = useAuth();

  return (
    <HookSection
      hook="useAuth"
      why={
        <>
          Subscribes to <code>onIdTokenChanged</code>, not <code>onAuthStateChanged</code>{' '}
          — so custom claims update on token refresh and a role change lands without a
          reload. <code>isLoading</code> is what stops a signed-in user seeing a flash of
          signed-out UI.
        </>
      }
      snippet={`const { firebaseUser, claims, isAuthenticated, isLoading } = useAuth();

if (isLoading) return <Spinner />;
if (claims?.isAdmin) showAdminNav();`}
      form={
        <p className="text-muted text-sm">
          No action — this one is live. The response updates as you sign in and out.
        </p>
      }
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
  );
}

function Profile({ auth }: WithAuth) {
  const errorFormat = useErrorFormat();
  const { update, loading, error, success } = useUpdateProfile(auth, {
    formatErrorMessage: errorFormat.value,
  });
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useUpdateProfile"
      why="Firebase treats profile fields as non-sensitive, so this is the one account operation that needs no reauthentication."
      snippet={hookSnippet({
        hook: 'useUpdateProfile',
        returns: 'update, loading, error, success',
        lines: [errorFormat.line],
        body: 'await update({ displayName, photoURL });',
      })}
      options={errorFormat.control}
      form={
        <>
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
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}

function Reauthenticate({ auth }: WithAuth) {
  const errorFormat = useErrorFormat();
  const { reauthenticateWithPassword, reauthenticateWithProvider, loading, error } =
    useReauthenticate(auth, { formatErrorMessage: errorFormat.value });
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useReauthenticate"
      why={
        <>
          The recent-sign-in check on its own, for sensitive flows the built-in{' '}
          <code>currentPassword</code> shortcut doesn't cover — and the provider variant
          is how you reauthenticate an OAuth-only account, which has no password to check.
        </>
      }
      snippet={hookSnippet({
        hook: 'useReauthenticate',
        returns: 'reauthenticateWithPassword, reauthenticateWithProvider',
        lines: [errorFormat.line],
        body: `const check = await reauthenticateWithPassword(currentPassword);
if (check.success) await performSensitiveOperation();`,
      })}
      options={errorFormat.control}
      form={
        <>
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
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}

function Link({ auth }: WithAuth) {
  const errorFormat = useErrorFormat();
  const { linkWithProvider, linkWithPassword, loading, error } = useLinkProvider(auth, {
    formatErrorMessage: errorFormat.value,
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useLinkProvider"
      why={
        <>
          The guest-upgrade path. Sign in anonymously, then link — the uid stays the same,
          so everything created while anonymous still belongs to them. Without it you'd
          have to migrate their data to a new account.
        </>
      }
      snippet={hookSnippet({
        hook: 'useLinkProvider',
        returns: 'linkWithProvider, linkWithPassword',
        lines: [errorFormat.line],
        body: `await linkWithProvider(new GoogleAuthProvider()); // guest → Google
await linkWithPassword(email, password);          // guest → password`,
      })}
      options={errorFormat.control}
      form={
        <>
          <Button
            disabled={loading}
            onClick={async () =>
              setResult(await linkWithProvider(new GoogleAuthProvider()))
            }
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
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}

function Unlink({ auth }: WithAuth) {
  const errorFormat = useErrorFormat();
  const { unlinkProvider, loading, error } = useUnlinkProvider(auth, {
    formatErrorMessage: errorFormat.value,
  });
  const [providerId, setProviderId] = useState('google.com');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useUnlinkProvider"
      why="Firebase refuses to unlink the last remaining method, so an account can't be locked out this way — the refusal arrives as an ordinary failure result you can show."
      snippet={hookSnippet({
        hook: 'useUnlinkProvider',
        returns: 'unlinkProvider, loading, error',
        lines: [errorFormat.line],
        body: 'await unlinkProvider("google.com");',
      })}
      options={errorFormat.control}
      form={
        <>
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
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}

function DeleteAccount({ auth }: WithAuth) {
  const errorFormat = useErrorFormat();
  const onBeforeDelete = useFlowCallback({
    name: 'onBeforeDelete',
    signature: '(user)',
    body: 'deleteUserRecord(user.uid)',
    throwsHint: 'The account survives — cleanup failing cannot orphan its records.',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [result, setResult] = useState<unknown>();
  const { deleteAccount, loading, error } = useDeleteAccount(auth, {
    formatErrorMessage: errorFormat.value,
    onBeforeDelete: onBeforeDelete.value,
  });

  return (
    <HookSection
      hook="useDeleteAccount"
      why={
        <>
          <code>onBeforeDelete</code> runs while the user still exists — the only moment
          your security rules will still let you delete their data. Throwing in it aborts
          the deletion, so failed cleanup can't orphan records.
        </>
      }
      snippet={hookSnippet({
        hook: 'useDeleteAccount',
        returns: 'deleteAccount, loading, error',
        lines: [onBeforeDelete.line, errorFormat.line],
        body: 'await deleteAccount({ currentPassword });',
      })}
      options={
        <>
          {onBeforeDelete.control}
          {errorFormat.control}
        </>
      }
      form={
        <>
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
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
