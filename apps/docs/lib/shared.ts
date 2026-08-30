// Read from the package itself, so the version shown on the site is always the
// one in the repo rather than a number that needs remembering at release time.
import pkg from '@timonwa/firebase-hooks/package.json' with { type: 'json' };

// Display name for chrome that a human reads; the scoped name is what search
// engines index, so it lives in titles and install snippets instead.
export const appName = 'Firebase Hooks';
export const packageName = '@timonwa/firebase-hooks';
export const packageVersion = pkg.version;
export const npmUrl = 'https://www.npmjs.com/package/@timonwa/firebase-hooks';
// Matches the first entry in .github/FUNDING.yml.
export const supportUrl = 'https://github.com/sponsors/Timonwa';
export const authorUrl = 'https://links.timonwa.com';
export const authorName = 'Timonwa';

export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'Timonwa',
  repo: 'firebase-hooks',
  branch: 'main',
};
