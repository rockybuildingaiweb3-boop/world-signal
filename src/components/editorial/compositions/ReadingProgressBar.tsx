import React, { useEffect, useState } from 'react';
import type { SignalDomain } from '../../../types/edition';

interface ReadingProgressBarProps {
  domain: SignalDomain;
  /** Reset progress when switching to a different dossier */
  resetKey: string;
}

function getDomainAccent(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return 'var(--ws-world)';
    case 'ai':
      return 'var(--ws-ai)';
    case 'economy':
      return 'var(--ws-economy)';
  }
}

/**
 * Subtle compositor-only hairline reading progress bar pinned cleanly below
 * the sticky TopBar in ExpandedView. Uses `transform: scaleX()` for zero
 * layout thrash and honors `prefers-reduced-motion`.
 */
export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  domain,
  resetKey,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 24) {
        setProgress(0);
        return;
      }
      const next = Math.max(0, Math.min(1, scrollTop / docHeight));
      setProgress(next);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [resetKey]);

  return (
    <div
      aria-hidden="true"
      data-testid="dossier-reading-progress"
      className="fixed left-0 right-0 top-[55px] z-30 h-[2.5px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full origin-left motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out"
        style={{
          backgroundColor: getDomainAccent(domain),
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  );
};
