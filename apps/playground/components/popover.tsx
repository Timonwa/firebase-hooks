'use client';

import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

/**
 * A trigger button and the panel it opens.
 *
 * Small enough to own rather than take a dependency for, but it does the three
 * things a hand-rolled dropdown usually skips: Escape closes it, a click
 * anywhere outside closes it, and focus returns to the trigger afterwards so
 * keyboard users aren't dropped at the top of the document.
 */
export function Popover({
  label,
  trigger,
  children,
}: {
  /** Accessible name for the trigger, and the panel's own label. */
  label: string;
  trigger: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? panelId : undefined}
        className={`grid size-8 place-items-center rounded-md transition-colors ${
          open ? 'bg-fg/5 text-fg' : 'text-muted hover:text-fg hover:bg-fg/5'
        }`}
      >
        {trigger}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={label}
          className="border-line bg-surface animate-pop absolute top-full right-0 z-50 mt-2 w-64 origin-top-right rounded-xl border p-1 shadow-lg"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
