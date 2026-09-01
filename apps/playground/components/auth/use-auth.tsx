'use client';

import { useAuth } from '@timonwa/firebase-hooks/auth';
import { HookSection } from '@/components/hook-section';

/** No Options panel: this hook takes none — it reads the provider's auth. */
export function UseAuthSection() {
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
