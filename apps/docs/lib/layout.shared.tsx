import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig, npmUrl, packageVersion } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-baseline gap-2">
          <span className="font-medium">{appName}</span>
          <span className="text-fd-muted-foreground rounded-full border px-1.5 py-0.5 text-[10px] leading-none">
            v{packageVersion}
          </span>
        </span>
      ),
    },
    links: [{ text: 'npm', url: npmUrl, external: true }],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
