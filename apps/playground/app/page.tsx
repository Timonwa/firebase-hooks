'use client';

import Link from 'next/link';
import { useFirebase } from '@/components/firebase-provider';
import { NeedsConfig } from '@/components/needs-config';

/** Ordered, because on a new project every flow except signup has nothing to act on. */
const STEPS = [
  {
    href: '/signing-in#use-signup',
    title: 'Create an account',
    body: 'A new project has no users, so signup is the first thing that can succeed. Everything else acts on an existing account.',
  },
  {
    href: '/signing-in#use-login',
    title: 'Sign in and out',
    body: 'Now that an account exists — plus OAuth, magic link, phone, and guest sessions.',
  },
  {
    href: '/account',
    title: 'Manage the account',
    body: 'Who the current user is, changing their profile, and adding or removing sign-in methods.',
  },
  {
    href: '/email',
    title: 'Email and password flows',
    body: 'Verification and resets. These arrive by email, so they finish on the page Firebase links back to.',
  },
];

export default function HomePage() {
  const { config } = useFirebase();
  if (!config) return <NeedsConfig />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Connected to <code className="text-accent font-mono">{config.projectId}</code>
        </h1>
        <p className="text-muted mt-2 text-sm">
          Every hook runs against this project. Change it in{' '}
          <code className="font-mono">.env.local</code> and restart.
        </p>
      </div>

      <div>
        <h2 className="font-medium">Start here</h2>
        <ol className="mt-3 flex flex-col gap-3">
          {STEPS.map((step, index) => (
            <li key={step.href}>
              <Link
                href={step.href}
                className="border-line bg-surface hover:border-accent flex gap-3 rounded-xl border p-4 transition-colors"
              >
                <span className="bg-accent/10 text-accent flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-medium">{step.title}</span>
                  <span className="text-muted mt-1 block text-sm">{step.body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <div className="border-line rounded-xl border p-4 text-sm">
        <p className="font-medium">Turn these on in the Firebase console</p>
        <p className="text-muted mt-1">
          Everything below works without them except the flows named.
        </p>
        <ul className="text-muted mt-3 flex flex-col gap-2">
          <li>
            <strong>Authentication → Sign-in method</strong> — enable the providers you
            want to try. Email/Password covers most of the playground.
          </li>
          <li>
            <strong>Authentication → Templates → action URL</strong> — set it to{' '}
            <code className="font-mono">http://localhost:3000/auth/action</code>. Firebase
            uses its own hosted pages by default; this playground has its own at{' '}
            <code className="font-mono">/auth/action</code>, so overriding it lets you
            watch <code className="font-mono">useVerifyEmail</code> and{' '}
            <code className="font-mono">useConfirmPasswordReset</code> run here.
          </li>
          <li>
            <strong>Sign-in method → Phone</strong> — needed for{' '}
            <code className="font-mono">usePhoneSignIn</code>. Real numbers work and get a
            real SMS; registering a <strong>test number</strong> lets you verify with a
            code you pick instead.
          </li>
        </ul>
      </div>
    </div>
  );
}
