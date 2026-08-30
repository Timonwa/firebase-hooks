import { highlight } from 'fumadocs-core/highlight';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import type { ReactNode } from 'react';

/**
 * Shiki-highlighted code for hand-written pages. MDX code fences get this from
 * the pipeline; JSX has to ask for it, which is why the landing page's samples
 * were rendering unhighlighted.
 *
 * Wraps the same CodeBlock the MDX pages use, so the copy button, scrollbars
 * and spacing match the docs rather than being a second look-alike.
 * Highlighting runs at build time — none of Shiki reaches the browser.
 */
/**
 * Soft-wrap instead of scroll. Fumadocs sizes its `pre` with `w-max` so long
 * lines scroll; overriding to `w-full` is what gives `pre-wrap` something to
 * wrap against. Without the `pre` override the wrap silently does nothing.
 */
const WRAP = '[&_pre]:w-full [&_code]:whitespace-pre-wrap [&_code]:break-words';

export async function CodeSample({
  code,
  lang = 'tsx',
  title,
  className,
  wrap = false,
}: {
  code: string;
  lang?: string;
  title?: ReactNode;
  className?: string;
  wrap?: boolean;
}): Promise<ReactNode> {
  return highlight(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    // Emit --shiki-light/--shiki-dark variables instead of a baked-in colour.
    // Fumadocs' stylesheet switches on those; without this the light theme is
    // hardcoded and the blocks stay light in dark mode.
    defaultColor: false,
    components: {
      pre: (props) => (
        <CodeBlock
          title={title}
          className={[wrap && WRAP, className].filter(Boolean).join(' ')}
          keepBackground={false}
        >
          <Pre {...props} />
        </CodeBlock>
      ),
    },
  });
}
