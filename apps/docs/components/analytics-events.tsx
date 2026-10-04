"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const AI_TOOL_ACTIONS: Record<string, string> = {
  "chatgpt.com": "open-in-chatgpt",
  "claude.ai": "open-in-claude",
  "scira.ai": "open-in-scira",
  "cursor.com": "open-in-cursor",
};

/**
 * Tracks clicks on UI Fumadocs renders itself — code-block copy buttons, the page
 * actions menu, nav and in-content links — which can't take data-umami-event.
 */
export function AnalyticsEvents() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest("a, button");
      // Elements with their own data-umami-event are already tracked by Umami.
      if (!control || control.hasAttribute("data-umami-event")) return;

      // Fumadocs' code-block copy button exposes no hook but this label.
      if (control.matches('button[aria-label="Copy Text"]')) {
        trackEvent("code-copy");
        return;
      }
      if (!(control instanceof HTMLAnchorElement)) return;

      const url = new URL(control.href);
      if (url.pathname.endsWith("/content.md")) {
        trackEvent("page-action", { action: "view-markdown" });
        return;
      }
      if (url.origin === window.location.origin) return;

      const aiAction = AI_TOOL_ACTIONS[url.hostname];
      if (aiAction) {
        trackEvent("page-action", { action: aiAction });
        return;
      }
      if (
        url.pathname.includes("/blob/") &&
        url.pathname.includes("/content/docs/")
      ) {
        trackEvent("page-action", { action: "open-in-github" });
        return;
      }
      // Path only: AI and share links carry the page text in their query string.
      trackEvent("outbound-click", { url: `${url.hostname}${url.pathname}` });
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}
