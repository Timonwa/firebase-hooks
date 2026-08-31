'use client';

import { formatFirebaseError } from '@timonwa/firebase-hooks';
import { AUTH_ERROR_MESSAGES, AuthProvider } from '@timonwa/firebase-hooks/auth';
import { getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { type PlaygroundConfig, getFirebaseConfig } from '@/lib/firebase-config';

type FirebaseContextValue = {
  auth: Auth | null;
  config: PlaygroundConfig | null;
  /** Whether the shipped auth/* catalogue is applied to error messages. */
  formatErrors: boolean;
  setFormatErrors: (value: boolean) => void;
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

function createAuth(config: PlaygroundConfig | null): Auth | null {
  if (!config) return null;
  // initializeApp throws on a duplicate name, which Fast Refresh would cause.
  const existing = getApps().find((app) => app.name === '[DEFAULT]');
  return getAuth(existing ?? initializeApp(config));
}

/**
 * The config comes from the environment, so it is known before the first render.
 * That removes the loading state the old paste-into-the-browser flow needed.
 */
export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [formatErrors, setFormatErrors] = useState(false);
  const config = getFirebaseConfig();
  const auth = useMemo(() => createAuth(config), [config]);

  return (
    <FirebaseContext.Provider value={{ auth, config, formatErrors, setFormatErrors }}>
      {/* Formatting is opt-in: with it off, `error` is Firebase's own message. */}
      <AuthProvider
        auth={auth}
        formatErrorMessage={
          formatErrors
            ? (error) => formatFirebaseError(error, { messages: AUTH_ERROR_MESSAGES })
            : undefined
        }
      >
        {children}
      </AuthProvider>
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used inside <FirebaseProvider>');
  return context;
}
