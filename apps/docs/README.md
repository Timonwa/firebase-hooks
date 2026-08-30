# docs

The documentation site for [`@timonwa/firebase-hooks`](../../packages/firebase-hooks), built with [Fumadocs](https://fumadocs.dev) on Next.js.

```bash
pnpm install          # from the repo root
pnpm build            # build the library first — the site imports it via its exports map
pnpm --filter docs dev
```

Open <http://localhost:3000>.

## Environment

| Variable               | Required | What it's for                                                 |
| ---------------------- | -------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | No       | Absolute origin for canonicals, the sitemap and OG image URLs |

**Nothing to configure on Vercel.** The origin resolves from `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel sets automatically. Set `NEXT_PUBLIC_SITE_URL` only once a custom domain points at the site.

Locally the origin falls back to `http://localhost:3000`. If your dev server picks a different port, OG image URLs will point at a port nothing is serving and link previews will fail to load the image — set `NEXT_PUBLIC_SITE_URL=http://localhost:3001` in `.env.local` to match.

## Layout

| Path                    | What it is                                                                   |
| ----------------------- | ---------------------------------------------------------------------------- |
| `content/docs/`         | The MDX pages; `meta.json` per folder controls nav order                     |
| `lib/source.ts`         | Content source adapter — the nav, sitemap and OG routes all read from it     |
| `lib/site.ts`           | Site config: origin, description, author, whether the env is indexable       |
| `lib/seo.ts`            | `buildMetadata()` — every page's canonical, OG, Twitter and robots           |
| `lib/schema.ts`         | JSON-LD graph, anchored by stable `@id`                                      |
| `lib/layout.shared.tsx` | Nav title, version pill, and the nav links                                   |
| `app/og/`               | OG image routes — `/og` for the home page, `/og/docs/*` prerendered per page |
| `app/(home)/`           | Landing page and its footer                                                  |
| `app/docs/`             | Documentation layout and pages                                               |

## Writing a page

Add an `.mdx` file under `content/docs/`, then list it in that folder's `meta.json`. An `index.mdx` becomes the folder's own page and should **not** be listed.

Options tables generate from the library's TSDoc rather than being hand-written:

```mdx
<AutoTypeTable
  path="../../packages/firebase-hooks/src/auth/use-login.ts"
  name="UseLoginOptionsProps"
/>
```

The interface must be exported, and each field needs a TSDoc line — an undocumented field renders an empty description cell.

## Formatting

This app is formatted by **Prettier**, not Biome — `pnpm --filter docs lint:fix`. Biome owns `packages/` and the repo root; the two scopes don't overlap.
