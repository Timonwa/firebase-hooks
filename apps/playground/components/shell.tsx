'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
import { AppSidebar } from './app-sidebar';
import { TopBar } from './top-bar';

/**
 * The page frame, and the owner of the drawer state.
 *
 * Below `lg` the sidebar is off-canvas and the top bar opens it; from `lg` up it
 * is always in the layout and this state is inert.
 */
export function Shell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  // A route change closes it. Jumping to a hook is an in-page anchor and leaves
  // the pathname alone, so the links close it themselves via `onNavigate`.
  useEffect(() => setNavOpen(false), [pathname]);

  useEffect(() => {
    if (!navOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false);
    };
    // The drawer covers the page, so the page behind it must not scroll.
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [navOpen]);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => setNavOpen(false)}
        className={`ease-panel fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 lg:hidden ${
          navOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <AppSidebar open={navOpen} onNavigate={() => setNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setNavOpen(true)} navOpen={navOpen} />
        <main className="px-6 py-8 lg:px-10">
          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
