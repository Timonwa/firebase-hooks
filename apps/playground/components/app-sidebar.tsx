'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SERVICES, toAnchor, toGroupAnchor } from '@/lib/hooks-map';
import { useActiveAnchor } from '@/lib/use-active-anchor';

export function AppSidebar() {
  const pathname = usePathname();

  const service = SERVICES.find((entry) => pathname.startsWith(entry.href));
  const anchors = service?.groups.flatMap((group) => group.hooks.map(toAnchor)) ?? [];
  const activeHook = useActiveAnchor(anchors);

  // A fixed-height flex column, so the brand block stays put and only the list
  // scrolls. `self-start` is what lets it stick at all: flex items otherwise
  // stretch to the page height and have nothing to stick against.
  return (
    <aside className="border-line bg-surface flex w-full shrink-0 flex-col border-b lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:self-start lg:border-r lg:border-b-0">
      <div className="border-line shrink-0 border-b p-5">
        <Link href="/" className="text-accent font-mono text-sm font-semibold">
          @timonwa/firebase-hooks
        </Link>
        <p className="text-muted mt-1 text-xs">playground</p>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
        {SERVICES.map((entry) => (
          <div key={entry.slug} className="flex flex-col gap-4">
            <Link
              href={entry.href}
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
