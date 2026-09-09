export function NeedsConfig() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          No project configured
        </h1>
        <p className="mt-2 text-sm text-muted">
          This harness runs the hooks against a real Firebase project. Point it
          at one of yours.
        </p>
      </div>

      <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-muted">
        <li>
          Copy <code className="font-mono">.env.example</code> to{" "}
          <code className="font-mono">.env.local</code>.
        </li>
        <li>
          Fill it in from the Firebase console:{" "}
          <strong>
            Project settings → Your apps → SDK setup and configuration
          </strong>
          .
        </li>
        <li>Restart the dev server.</li>
      </ol>

      <pre className="overflow-x-auto surface p-4 font-mono text-xs">
        {`NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=`}
      </pre>
    </div>
  );
}
