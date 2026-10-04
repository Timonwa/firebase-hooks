declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, string>) => void;
    };
  }
}

/** Sends a custom Umami event; a no-op when the tracker hasn't loaded (local, preview, blocked). */
export function trackEvent(event: string, data?: Record<string, string>) {
  window.umami?.track(event, data);
}
