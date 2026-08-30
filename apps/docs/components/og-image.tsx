import type { ReactElement } from 'react';
import { siteConfig } from '@/lib/site';

/**
 * The shared 1200×630 OG card. Rendered by Satori, which supports flexbox and
 * inline styles only — no grid, no CSS variables — so the brand values are
 * repeated here as literals rather than read from the stylesheet.
 */
const VIOLET = '#8b7cf6';
const BACKGROUND = '#0f0e14';
const FOREGROUND = '#f4f4f6';
const MUTED = '#a1a1ab';

export function OgImage({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: BACKGROUND,
        // A gradient rather than a blurred element: Satori's blur() support is
        // unreliable, and this renders the same wash predictably.
        backgroundImage: `radial-gradient(900px 460px at 78% -12%, ${VIOLET}44, transparent 70%), radial-gradient(700px 400px at 6% 108%, ${VIOLET}22, transparent 70%)`,
        padding: '72px',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 9999,
            backgroundColor: VIOLET,
            display: 'flex',
          }}
        />
        <div style={{ fontSize: 26, color: MUTED, letterSpacing: -0.2 }}>
          {siteConfig.packageName}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: title.length > 34 ? 66 : 82,
            lineHeight: 1.08,
            color: FOREGROUND,
            letterSpacing: -2,
            fontWeight: 600,
            display: 'flex',
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 26,
              fontSize: 30,
              lineHeight: 1.4,
              color: MUTED,
              display: 'flex',
              // Satori has no line clamp; the slice keeps a long description
              // from pushing the footer off the card.
              maxWidth: 940,
            }}
          >
            {subtitle.length > 130 ? `${subtitle.slice(0, 129).trimEnd()}…` : subtitle}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid #2a2833`,
          paddingTop: 28,
        }}
      >
        <div style={{ fontSize: 26, color: FOREGROUND }}>{siteConfig.name}</div>
        <div style={{ fontSize: 24, color: MUTED }}>Firebase Auth · React 18 & 19</div>
      </div>
    </div>
  );
}
