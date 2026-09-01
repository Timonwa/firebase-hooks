'use client';

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

const OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀' },
  { value: 'dark', label: 'Dark', icon: '☾' },
  { value: 'system', label: 'System', icon: '◐' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="border-line flex gap-0.5 rounded-md border p-0.5"
      role="group"
      aria-label="Theme"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          aria-pressed={theme === option.value}
          title={option.label}
          className={`flex-1 rounded px-2 py-1 text-xs transition-colors ${
            theme === option.value
              ? 'bg-accent text-accent-fg'
              : 'text-muted hover:text-fg'
          }`}
        >
          <span aria-hidden>{option.icon}</span>
          <span className="sr-only">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
