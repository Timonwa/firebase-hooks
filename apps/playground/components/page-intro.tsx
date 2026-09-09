export function PageIntro({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="mb-8 border-b border-line pb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-pretty text-muted">{lead}</p>
    </header>
  );
}
