import Link from 'next/link';
import { appName, npmUrl, packageVersion } from '@/lib/shared';

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-bold sm:text-4xl">{appName}</h1>
      <p className="max-w-xl text-fd-muted-foreground">
        Typed React hooks for Firebase — one hook per flow, with its state, errors, and
        callbacks handled. Every action returns a result you can branch on.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/docs"
          className="rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground"
        >
          Read the docs
        </Link>
        <a
          href={npmUrl}
          className="rounded-lg border px-4 py-2 text-sm font-medium"
          rel="noreferrer noopener"
        >
          npm · v{packageVersion}
        </a>
      </div>
    </div>
  );
}
