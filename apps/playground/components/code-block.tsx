'use client';

import { useEffect, useState } from 'react';
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import githubDark from 'shiki/themes/github-dark.mjs';
import githubLight from 'shiki/themes/github-light.mjs';
import json from 'shiki/langs/json.mjs';
import tsx from 'shiki/langs/tsx.mjs';
import { useFirebase } from './firebase-provider';

/**
 * One highlighter for the whole page, created lazily on first use.
 *
 * The fine-grained core plus the JavaScript regex engine keeps this far smaller
 * than the full bundle — two languages and two themes instead of every grammar
 * Shiki ships, and no Oniguruma WASM.
 */
let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighterCore({
    themes: [githubLight, githubDark],
    langs: [tsx, json],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighterPromise;
}

export function CodeBlock({
  code,
  lang = 'tsx',
  tone = 'surface',
}: {
  code: string;
  lang?: 'tsx' | 'json';
  /** `inset` for a block nested inside a panel, where `surface` on `surface` disappears. */
  tone?: 'surface' | 'inset';
}) {
  const { wrapCode: wrap } = useFirebase();
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getHighlighter().then((highlighter) => {
      if (!active) return;
      setHtml(
        highlighter.codeToHtml(code, {
          lang,
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
  }, [code, lang]);

  // Shiki's own `pre` carries `white-space: pre`, so wrapping has to reach into
  // it rather than sit on the container.
  const chrome = tone === 'surface' ? 'surface' : 'bg-bg border-line rounded-md border';

  const flow = wrap
    ? '[&_pre]:whitespace-pre-wrap [&_pre]:wrap-break-word'
    : 'overflow-x-auto';

  // Plain text until the highlighter resolves, so the snippet is readable
  // immediately and never shifts layout.
  if (!html) {
    return (
      <pre
        className={`p-4 font-mono text-xs leading-relaxed ${chrome} ${
          wrap ? 'wrap-break-word whitespace-pre-wrap' : 'overflow-x-auto'
        }`}
      >
        {code}
      </pre>
    );
  }

  return (
    <div
      className={`shiki-block text-xs leading-relaxed ${chrome} ${flow}`}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output from
      // a hardcoded snippet, not user input.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
