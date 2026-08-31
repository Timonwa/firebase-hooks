'use client';

import { useEffect, useState } from 'react';
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import githubDark from 'shiki/themes/github-dark.mjs';
import githubLight from 'shiki/themes/github-light.mjs';
import tsx from 'shiki/langs/tsx.mjs';

/**
 * One highlighter for the whole page, created lazily on first use.
 *
 * The fine-grained core plus the JavaScript regex engine keeps this far smaller
 * than the full bundle — one language and two themes instead of every grammar
 * Shiki ships, and no Oniguruma WASM.
 */
let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighterCore({
    themes: [githubLight, githubDark],
    langs: [tsx],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighterPromise;
}

export function CodeBlock({ code }: { code: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getHighlighter().then((highlighter) => {
      if (!active) return;
      setHtml(
        highlighter.codeToHtml(code, {
          lang: 'tsx',
          themes: { light: 'github-light', dark: 'github-dark' },
          // Emits --shiki-light/--shiki-dark variables instead of a baked-in
          // colour, so globals.css can switch them with the rest of the theme.
          defaultColor: false,
        }),
      );
    });
    return () => {
      active = false;
    };
  }, [code]);

  // Plain text until the highlighter resolves, so the snippet is readable
  // immediately and never shifts layout.
  if (!html) {
    return (
      <pre className="surface overflow-x-auto p-4 font-mono text-xs leading-relaxed">
        {code}
      </pre>
    );
  }

  return (
    <div
      className="shiki-block surface overflow-x-auto text-xs leading-relaxed"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output from
      // a hardcoded snippet, not user input.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
