'use client';

import { useEffect, useState } from 'react';

/**
 * The id of the section currently being read.
 *
 * A scroll listener rather than IntersectionObserver: sections are taller than
 * the viewport, so several are "intersecting" at once and the observer only
 * fires when that set changes — the highlight would sit still through most of a
 * long section. This picks whichever heading last passed the top instead.
 */
export function useActiveAnchor(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  // Arrays are rebuilt every render, so the effect keys off the contents.
  const key = ids.join('|');

  useEffect(() => {
    const elements = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const passed = elements.filter(
        (element) => element.getBoundingClientRect().top <= 120,
      );
      setActive((passed.at(-1) ?? elements[0]).id);
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [key]);

  return active;
}
