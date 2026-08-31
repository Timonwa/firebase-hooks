import type { FirebaseOptions } from 'firebase/app';

export type PlaygroundConfig = FirebaseOptions &
  Record<'apiKey' | 'authDomain' | 'projectId' | 'appId', string>;

/** Read once at boot from `.env.local`; see `.env.example`. */
export function getFirebaseConfig(): PlaygroundConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) return null;
  return { apiKey, authDomain, projectId, appId };
}
