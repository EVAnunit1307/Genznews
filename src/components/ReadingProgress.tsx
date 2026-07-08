import { useEffect, useState } from 'react';

/**
 * Thin red reading-progress bar pinned to the top of the viewport.
 * Tracks whole-document scroll. Ported from the original SPA ProgressBar.
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tick = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop / (el.scrollHeight - el.clientHeight) || 0;
      setProgress(Math.min(1, Math.max(0, scrolled)));
    };
    window.addEventListener('scroll', tick, { passive: true });
    tick();
    return () => window.removeEventListener('scroll', tick);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-white/5" aria-hidden="true">
      <div
        className="h-full bg-live"
        style={{ width: `${progress * 100}%`, transition: 'width 80ms linear' }}
      />
    </div>
  );
}
