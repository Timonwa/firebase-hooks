'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/demo-card';
import { useFirebase } from '@/components/firebase-provider';
import { parseFirebaseConfig } from '@/lib/firebase-config';

const PLACEHOLDER = `{
  "apiKey": "AIza…",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project",
  "appId": "1:123…:web:abc…"
}`;

export default function SetupPage() {
  const { config, ready, connect, disconnect } = useFirebase();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  function onConnect() {
    const result = parseFirebaseConfig(input);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    connect(result.config);
  }

  if (!ready) return <p className="text-sm text-neutral-500">Loading…</p>;

  if (config) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Connected</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Running against{' '}
            <code className="font-mono text-violet-600 dark:text-violet-400">
              {config.projectId}
            </code>
            . Every hook below talks to your project.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              href: '/sign-in',
              title: 'Sign in',
              body: 'Email, OAuth, magic link, anonymous, custom token',
            },
            {
              href: '/sign-in/phone',
              title: 'Phone',
              body: 'SMS code with a managed reCAPTCHA',
            },
            {
              href: '/forgot-password',
              title: 'Password',
              body: 'Reset email and confirming the code',
            },
            {
              href: '/account',
              title: 'Account',
              body: 'Profile, email, password, linking, deletion',
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-violet-400 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="font-medium">{card.title}</p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {card.body}
              </p>
            </Link>
          ))}
        </div>

        <div className="rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-800">
          <p className="font-medium">Before you start</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral-600 dark:text-neutral-400">
            <li>
              Enable the sign-in providers you want to try in the Firebase console under{' '}
              <strong>Authentication → Sign-in method</strong>.
            </li>
            <li>
              Add{' '}
              <code className="font-mono">
                {typeof window !== 'undefined' ? window.location.hostname : 'this domain'}
              </code>{' '}
              to <strong>Authentication → Settings → Authorized domains</strong>, or OAuth
              and email links will be rejected.
            </li>
            <li>
              For phone auth, add a test number under{' '}
              <strong>Sign-in method → Phone → Test numbers</strong> so you aren’t charged
              for real SMS.
            </li>
          </ul>
        </div>

        <Button variant="secondary" onClick={disconnect}>
          Disconnect and clear config
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Try the hooks</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          This demo runs against <strong>your</strong> Firebase project, not mine — so
          nobody burns anyone else’s SMS quota. Paste your web config to begin.
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-neutral-600 dark:text-neutral-400">
          Firebase console → Project settings → Your apps → SDK setup and configuration
        </span>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={10}
          spellCheck={false}
          placeholder={PLACEHOLDER}
          className="rounded-md border border-neutral-300 bg-white p-3 font-mono text-xs outline-none focus:border-violet-500 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <Button onClick={onConnect}>Connect</Button>

      <p className="text-xs text-neutral-500">
        Stored in this browser’s localStorage and never sent anywhere. Firebase web config
        is public by design — it identifies your project, it doesn’t authorise anything.
        Your security rules and authorized domains are what protect it.
      </p>
    </div>
  );
}
