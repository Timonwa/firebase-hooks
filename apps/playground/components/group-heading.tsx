import { toGroupAnchor } from '@/lib/hooks-map';

/** Divides the service page into the same groups the docs use. */
export function GroupHeading({ label, lead }: { label: string; lead: string }) {
  return (
    <section id={toGroupAnchor(label)} className="scroll-mt-20 pt-12 first:pt-0">
      <h2 className="text-2xl font-semibold tracking-tight">{label}</h2>
      <p className="text-muted mt-2 max-w-2xl text-pretty">{lead}</p>
    </section>
  );
}
