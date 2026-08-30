import { siteConfig } from './site';

// Stable @id values so the nodes reference each other as one graph rather than
// being emitted as disconnected islands.
const PERSON_ID = `${siteConfig.url}/#person`;
const SITE_ID = `${siteConfig.url}/#website`;
const SOFTWARE_ID = `${siteConfig.url}/#software`;

const absolute = (path: string) => new URL(path, siteConfig.url).toString();

export function personSchema() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: siteConfig.author,
    url: siteConfig.socials[0],
    sameAs: [...siteConfig.socials],
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: 'en',
    publisher: { '@id': PERSON_ID },
  };
}

/**
 * SoftwareSourceCode rather than SoftwareApplication: this is a library other
 * people build with, not an app anyone runs.
 */
export function softwareSchema() {
  return {
    '@type': 'SoftwareSourceCode',
    '@id': SOFTWARE_ID,
    name: siteConfig.packageName,
    description: siteConfig.description,
    url: siteConfig.url,
    codeRepository: 'https://github.com/Timonwa/firebase-hooks',
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'React',
    license: 'https://opensource.org/licenses/MIT',
    author: { '@id': PERSON_ID },
    isPartOf: { '@id': SITE_ID },
  };
}

export function siteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [personSchema(), websiteSchema(), softwareSchema()],
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  };
}

export function techArticleSchema({
  title,
  description,
  path,
}: {
  title: string;
  description?: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    ...(description && { description }),
    url: absolute(path),
    author: { '@id': PERSON_ID },
    isPartOf: { '@id': SITE_ID },
    about: { '@id': SOFTWARE_ID },
  };
}
