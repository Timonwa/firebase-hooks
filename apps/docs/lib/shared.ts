// Read from the package itself, so the version shown on the site is always the
// one in the repo rather than a number that needs remembering at release time.
import pkg from '@timonwa/firebase-hooks/package.json' with { type: 'json' };

export const appName = '@timonwa/firebase-hooks';
export const packageVersion = pkg.version;
export const npmUrl = 'https://www.npmjs.com/package/@timonwa/firebase-hooks';

export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'Timonwa',
  repo: 'firebase-hooks',
  branch: 'main',
};
