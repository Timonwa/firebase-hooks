export function PageIntro({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="border-line mb-8 border-b pb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted mt-2 max-w-2xl text-pretty">{lead}</p>
    </header>
  );
}
