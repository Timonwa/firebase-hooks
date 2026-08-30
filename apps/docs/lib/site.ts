import { appName, packageName } from './shared';

/**
 * Resolved rather than hardcoded, so canonicals and the sitemap are correct on
 * the real domain without a code change. Set NEXT_PUBLIC_SITE_URL once a custom
 * domain exists; until then Vercel's own production URL is used.
 */
const resolvedUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

/**
 * Only the production deployment is indexable. Preview and local builds emit
 * noindex, so Vercel's per-commit URLs never compete with the real site.
 */
export const isIndexableEnv =
  (process.env.VERCEL_ENV ?? process.env.NODE_ENV) === 'production';

export const siteConfig = {
  name: appName,
  packageName,
  // No trailing slash: every path is appended directly.
  url: resolvedUrl.replace(/\/$/, ''),
  description:
    'Typed React hooks for Firebase — one hook per flow, with its state, errors and callbacks handled. Every action returns a result you can branch on.',
  defaultImageAlt: `${appName} — typed React hooks for Firebase`,
  author: 'Timonwa Akintokun',
  twitter: '@timonwa_',
  socials: ['https://github.com/Timonwa', 'https://www.npmjs.com/~timonwa'],
} as const;
