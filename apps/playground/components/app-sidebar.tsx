'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SERVICES, toAnchor, toGroupAnchor } from '@/lib/hooks-map';
import { useActiveAnchor } from '@/lib/use-active-anchor';

export function AppSidebar({
  open = false,
  onNavigate,
}: {
  open?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const service = SERVICES.find((entry) => pathname.startsWith(entry.href));
  const anchors = service?.groups.flatMap((group) => group.hooks.map(toAnchor)) ?? [];
  const activeHook = useActiveAnchor(anchors);

  // A fixed-height flex column, so the brand block stays put and only the list
  // scrolls. `self-start` is what lets it stick at all: flex items otherwise
  // stretch to the page height and have nothing to stick against.
  //
  // `invisible` rather than transform alone when closed: an off-screen drawer
  // that is merely translated still holds its links in the tab order, so a
  // keyboard user would tab into a menu they cannot see.
  return (
    <aside
      className={`border-line bg-surface fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] shrink-0 flex-col border-r transition-[transform,visibility] duration-200 ease-panel lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-64 lg:max-w-none lg:translate-x-0 lg:self-start lg:visible ${
        open ? 'visible translate-x-0' : 'invisible -translate-x-full'
      }`}
    >
      <div className="border-line flex shrink-0 items-start gap-2 border-b p-5">
        <div className="min-w-0 flex-1">
          <Link
            href="/"
            onClick={onNavigate}
            className="text-accent font-mono text-sm font-semibold"
          >
            @timonwa/firebase-hooks
          </Link>
          <p className="text-muted mt-1 text-xs">playground</p>
        </div>
        <button
          type="button"
          onClick={onNavigate}
          aria-label="Close navigation"
          className="text-muted hover:text-fg hover:bg-fg/5 -mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-md transition-colors lg:hidden"
        >
          <X className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
        {SERVICES.map((entry) => (
          <div key={entry.slug} className="flex flex-col gap-4">
            <Link
              href={entry.href}
              onClick={onNavigate}
              className={`text-sm font-semibold ${
                pathname.startsWith(entry.href) ? 'text-fg' : 'text-muted hover:text-fg'
              }`}
            >
              {entry.label}
            </Link>

            {entry.groups.map((group) => (
              <div key={group.label}>
                <Link
                  href={`${entry.href}#${toGroupAnchor(group.label)}`}
                  onClick={onNavigate}
                  className="text-muted hover:text-fg mb-2 block text-xs font-semibold tracking-wider uppercase"
                >
                  {group.label}
                </Link>
                <ul className="border-line flex flex-col gap-0.5 border-l pl-3">
                  {group.hooks.map((hook) => {
                    const current = activeHook === toAnchor(hook);
                    return (
                      <li key={hook}>
                        <Link
                          href={`${entry.href}#${toAnchor(hook)}`}
                          onClick={onNavigate}
                          aria-current={current ? 'true' : undefined}
                          className={`-ml-3 block border-l-2 py-0.5 pl-3 font-mono text-xs ${
                            current
                              ? 'border-accent text-accent font-medium'
                              : 'text-muted hover:text-accent border-transparent'
                          }`}
                        >
                          {hook}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        ))}

        <a
          href="https://firebase-hooks.vercel.app/docs"
          target="_blank"
          rel="noreferrer noopener"
          className="text-muted hover:text-fg mt-auto pt-4 text-xs underline underline-offset-4"
        >
          Read the docs ↗
        </a>
      </nav>
    </aside>
  );
}
