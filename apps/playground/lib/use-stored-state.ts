'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * State that outlives a refresh.
 *
 * Reads storage in an effect rather than during render: the pages are
 * prerendered, so touching localStorage while rendering would disagree with the
 * HTML the server produced and break hydration.
 *
 * Writing happens in the setter, not a second effect. An effect keyed on the
 * value runs in the same commit as the read above with the fallback still in
 * hand, so it writes that fallback over whatever was stored — and under Strict
 * Mode the read then runs again and picks up the value it just clobbered.
 */
export function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored) as T);
    } catch {
      // Private mode, or a value written by an older build — keep the fallback.
    }
  }, [key]);

  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage full or blocked; the setting still works for this session.
      }
    },
    [key],
  );

  return [value, set] as const;
}
