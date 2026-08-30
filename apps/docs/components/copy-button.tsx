'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Copy-to-clipboard for the hero's install command, which is plain text rather
 * than a code block. Code samples use Fumadocs' CodeBlock, which brings its own.
 */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  // Reset from an effect so the timer is cleared if the button unmounts, and
  // so a second click restarts the window instead of stacking timeouts.
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        navigator.clipboard.writeText(value).then(
          () => setCopied(true),
          // Clipboard access can be denied; failing silently is better than
          // throwing, and the user can still select the text by hand.
          () => {},
        );
      }}
      className="text-fd-muted-foreground hover:text-fd-foreground -mr-1 rounded p-1 transition-colors"
    >
      {copied ? (
        <Check className="text-fd-primary size-3.5" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
    </button>
  );
}
