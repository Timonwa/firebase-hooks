'use client';

import { formatFirebaseError } from '@timonwa/firebase-hooks';
import { AUTH_ERROR_MESSAGES, AuthProvider } from '@timonwa/firebase-hooks/auth';
import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  clearStoredConfig,
  type DemoFirebaseConfig,
  readStoredConfig,
  storeConfig,
} from '@/lib/firebase-config';

type FirebaseContextValue = {
  auth: Auth | null;
  config: DemoFirebaseConfig | null;
  /** False until the stored config has been read, so pages don't flash "set up". */
  ready: boolean;
  connect: (config: DemoFirebaseConfig) => void;
  disconnect: () => void;
  /** Whether the shipped auth/* catalogue is applied to error messages. */
  formatErrors: boolean;
  setFormatErrors: (value: boolean) => void;
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

function createAuth(config: DemoFirebaseConfig): Auth {
  // Reuse the app across re-renders and Fast Refresh; initializeApp throws on a
  // duplicate name.
  const existing = getApps().find((app) => app.name === '[DEFAULT]');
  const app: FirebaseApp = existing ?? initializeApp(config);
  return getAuth(app);
}

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DemoFirebaseConfig | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [ready, setReady] = useState(false);
  const [formatErrors, setFormatErrors] = useState(false);

  // localStorage is only readable on the client, so the config arrives after the
  // first paint. Every hook accepts a null auth, which is what makes that safe.
  useEffect(() => {
    const stored = readStoredConfig();
    if (stored) {
      setConfig(stored);
      setAuth(createAuth(stored));
    }
    setReady(true);
  }, []);

  const connect = useCallback((next: DemoFirebaseConfig) => {
    storeConfig(next);
    setConfig(next);
    setAuth(createAuth(next));
  }, []);

  const disconnect = useCallback(() => {
    clearStoredConfig();
    // A full reload is the honest way to drop an initialised Firebase app —
    // deleteApp leaves hooks holding a dead Auth instance.
    window.location.href = '/';
  }, []);

  return (
    <FirebaseContext.Provider
      value={{ auth, config, ready, connect, disconnect, formatErrors, setFormatErrors }}
    >
      {/* Formatting is opt-in: with it off, `error` is Firebase's own message.
          The toggle in the nav flips this so the difference is visible. */}
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
