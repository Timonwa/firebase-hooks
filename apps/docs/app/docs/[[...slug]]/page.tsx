import { getPageImageUrl, getPageMarkdownUrl, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema, techArticleSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';
import { gitConfig } from '@/lib/shared';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;

  // Breadcrumbs mirror the URL, which is what Google expects them to.
  const trail = [
    { name: 'Docs', path: '/docs' },
    ...page.slugs.map((_, index) => ({
      name:
        source.getPage(page.slugs.slice(0, index + 1))?.data.title ?? page.slugs[index],
      path: `/docs/${page.slugs.slice(0, index + 1).join('/')}`,
    })),
  ];

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <JsonLd
        data={[
          techArticleSchema({
            title: page.data.title,
            description: page.data.description,
            path: page.url,
          }),
          breadcrumbSchema(trail),
        ]}
      />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // Routed through the shared builder so docs pages get the same canonical,
  // Twitter card and env-gated robots as everything else.
  return buildMetadata({
    title: page.data.title,
    description: page.data.description,
    path: page.url,
    imageUrl: getPageImageUrl(page).url,
    imageAlt: page.data.title,
    type: 'article',
  });
}
