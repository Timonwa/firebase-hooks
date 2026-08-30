import type { FirebaseOptions } from 'firebase/app';

export const CONFIG_STORAGE_KEY = 'firebase-hooks-demo:config';

/** The fields Firebase Auth actually needs. `appId` is required by initializeApp. */
const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;

export type DemoFirebaseConfig = FirebaseOptions &
  Record<(typeof REQUIRED_KEYS)[number], string>;

/**
 * Accepts either raw JSON or a pasted `const firebaseConfig = {...}` snippet,
 * because that is what the Firebase console actually hands you — demanding
 * clean JSON would fail on the exact thing most people paste.
 */
export function parseFirebaseConfig(
  input: string,
): { ok: true; config: DemoFirebaseConfig } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: 'Paste your Firebase config to continue.' };

  const objectLiteral = trimmed.slice(trimmed.indexOf('{'), trimmed.lastIndexOf('}') + 1);
  if (!objectLiteral)
    return { ok: false, error: "Couldn't find a config object in that." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(objectLiteral);
  } catch {
    try {
      // Quote bare keys and swap single quotes, so a JS object literal parses.
      const normalised = objectLiteral
        .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
        .replace(/'/g, '"')
        .replace(/,(\s*[}\]])/g, '$1');
      parsed = JSON.parse(normalised);
    } catch {
      return { ok: false, error: "That doesn't look like a Firebase config object." };
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: "That doesn't look like a Firebase config object." };
  }

  const record = parsed as Record<string, unknown>;
  const missing = REQUIRED_KEYS.filter((key) => typeof record[key] !== 'string');
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing required ${missing.length === 1 ? 'field' : 'fields'}: ${missing.join(', ')}.`,
    };
  }

  return { ok: true, config: record as DemoFirebaseConfig };
}

export function readStoredConfig(): DemoFirebaseConfig | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!raw) return null;

  const result = parseFirebaseConfig(raw);
  // Drop anything unparseable rather than crashing every page that reads it.
  return result.ok ? result.config : null;
}

export function storeConfig(config: DemoFirebaseConfig) {
  window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function clearStoredConfig() {
  window.localStorage.removeItem(CONFIG_STORAGE_KEY);
}
