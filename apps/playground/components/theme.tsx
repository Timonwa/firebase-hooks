'use client';

import { type LucideIcon, Moon, Monitor, Sun } from 'lucide-react';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'playground-theme';

/**
 * Runs before the first paint, so the page never flashes the wrong theme.
 *
 * Inlined as a blocking script rather than done in an effect: an effect runs
 * after paint, which is exactly the flash this avoids. Kept in sync with the
 * resolve logic below by hand — it cannot import anything.
 */
export const themeScript = `(() => {
  try {
    const stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = !stored || stored === 'system' ? system : stored;
  } catch {
    document.documentElement.dataset.theme = 'light';
  }
})();`;

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);

function apply(theme: Theme) {
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  document.documentElement.dataset.theme = theme === 'system' ? system : theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Starts at "system" on both server and client, then reads storage in an
  // effect — reading it during render would disagree with the HTML the server
  // sent and break hydration. The inline script has already painted correctly.
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    apply(theme);
    if (theme !== 'system') return;

    // Only while following the system: track changes made after load.
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
}

/** Cycle order, so one button covers all three. */
const CYCLE: { value: Theme; label: string; Icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const index = CYCLE.findIndex((entry) => entry.value === theme);
  const current = CYCLE[index === -1 ? 2 : index];
  const next = CYCLE[(index + 1) % CYCLE.length];
  const { Icon } = current;

  return (
    <button
      type="button"
      onClick={() => setTheme(next.value)}
      // The icon alone can't say what a click will do, so the label carries
      // both the current state and the next one.
      aria-label={`Theme: ${current.label.toLowerCase()}. Switch to ${next.label.toLowerCase()}.`}
      title={`Theme: ${current.label} → ${next.label}`}
      className="text-muted hover:text-fg hover:bg-fg/5 grid size-8 place-items-center rounded-md transition-colors"
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
