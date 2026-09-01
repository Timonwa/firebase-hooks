'use client';

import { UseAnonymousSignInSection } from '@/components/auth/use-anonymous-sign-in';
import { UseAuthSection } from '@/components/auth/use-auth';
import { UseConfirmPasswordResetSection } from '@/components/auth/use-confirm-password-reset';
import { UseCustomTokenSignInSection } from '@/components/auth/use-custom-token-sign-in';
import { UseDeleteAccountSection } from '@/components/auth/use-delete-account';
import { UseEmailLinkSignInSection } from '@/components/auth/use-email-link-sign-in';
import { UseLinkProviderSection } from '@/components/auth/use-link-provider';
import { UseLoginSection } from '@/components/auth/use-login';
import { UseLogoutSection } from '@/components/auth/use-logout';
import { UseOAuthSignInSection } from '@/components/auth/use-oauth-sign-in';
import { UsePhoneSignInSection } from '@/components/auth/use-phone-sign-in';
import { UseReauthenticateSection } from '@/components/auth/use-reauthenticate';
import { UseSendEmailVerificationSection } from '@/components/auth/use-send-email-verification';
import { UseSendPasswordResetEmailSection } from '@/components/auth/use-send-password-reset-email';
import { UseSignupSection } from '@/components/auth/use-signup';
import { UseUnlinkProviderSection } from '@/components/auth/use-unlink-provider';
import { UseUpdateEmailSection } from '@/components/auth/use-update-email';
import { UseUpdatePasswordSection } from '@/components/auth/use-update-password';
import { UseUpdateProfileSection } from '@/components/auth/use-update-profile';
import { UseVerifyEmailSection } from '@/components/auth/use-verify-email';
import { useFirebase } from '@/components/firebase-provider';
import { GroupHeading } from '@/components/group-heading';
import { NeedsConfig } from '@/components/needs-config';
import { PageIntro } from '@/components/page-intro';

/**
 * Every auth hook on one page, grouped the way the docs group them.
 *
 * One page per service: a new service is its own route rendering its own
 * sections, so nothing here has to grow.
 */
export default function AuthPage() {
  const { config } = useFirebase();
  if (!config) return <NeedsConfig />;

  return (
    <>
      <PageIntro
        title="Auth"
        lead="Every auth hook, running against your project. Start with useSignup — a new project has no accounts, so everything else needs one first."
      />

      <GroupHeading
        label="Signing in and out"
        lead="Getting someone into the app, and back out."
      />
      <UseSignupSection />
      <UseLoginSection />
      <UseLogoutSection />
      <UseOAuthSignInSection />
      <UseEmailLinkSignInSection />
      <UsePhoneSignInSection />
      <UseAnonymousSignInSection />
      <UseCustomTokenSignInSection />

      <GroupHeading
        label="Passwords"
        lead="The forgot-password journey end to end, plus changing a password from inside the app."
      />
      <UseSendPasswordResetEmailSection />
      <UseConfirmPasswordResetSection />
      <UseUpdatePasswordSection />

      <GroupHeading
        label="Email"
        lead="Proving an address belongs to the user, and changing it safely. Both round-trip through an email."
      />
      <UseSendEmailVerificationSection />
      <UseVerifyEmailSection />
      <UseUpdateEmailSection />

      <GroupHeading
        label="Account and linking"
        lead="Everything that acts on the account someone is already signed in to — reading it, editing it, proving it's still them, and closing it."
      />
      <UseAuthSection />
      <UseUpdateProfileSection />
      <UseReauthenticateSection />
      <UseLinkProviderSection />
      <UseUnlinkProviderSection />
      <UseDeleteAccountSection />
    </>
  );
}
