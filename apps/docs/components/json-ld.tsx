/**
 * Escapes the four sequences that can break out of a <script> block or are
 * invalid raw inside a JS string, so page data can never inject markup.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data)
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD has no other
    // injection point, and the payload is escaped above.
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
