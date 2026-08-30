import Link from 'next/link';

export function NeedsConfig() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="font-medium">No Firebase project connected</p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        This demo runs against your own project. Paste your web config on the setup page
        to start.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500"
      >
        Go to setup
      </Link>
    </div>
  );
}
