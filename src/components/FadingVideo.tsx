import { useCallback, useEffect, useRef, type CSSProperties } from 'react';

/**
 * rAF-driven crossfade looping video (ported from the original SPA).
 * Mobile perf: pauses when offscreen, and skips playback under
 * prefers-reduced-motion or Save-Data (shows a static first frame).
 */
const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55;

interface Props {
  src: string;
  poster?: string;
  className?: string;
  style?: CSSProperties;
  /** Hero use: download frames immediately (preload=auto) instead of just metadata. */
  eager?: boolean;
}

export default function FadingVideo({
  src,
  poster,
  className = '',
  style = {},
  eager = false,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const rafRef = useRef(0);
  const fadingOutRef = useRef(false);

  const fadeTo = useCallback((target: number, duration: number) => {
    const v = ref.current;
    if (!v) return;
    cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const from = parseFloat(v.style.opacity || '0');
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      v.style.opacity = String(from + (target - from) * t);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } })
      ?.connection?.saveData;
    if (reduce || saveData) {
      v.style.opacity = '1';
      v.removeAttribute('autoplay');
      return;
    }

    v.style.opacity = '0';
    const onLoaded = () => {
      v.style.opacity = '0';
      v.play().catch(() => {});
      fadeTo(1, FADE_MS);
    };
    const onTime = () => {
      if (fadingOutRef.current) return;
      const remain = (v.duration || 0) - v.currentTime;
      if (remain <= FADE_OUT_LEAD && remain > 0) {
        fadingOutRef.current = true;
        fadeTo(0, FADE_OUT_LEAD * 1000);
      }
    };
    const onEnded = () => {
      v.style.opacity = '0';
      window.setTimeout(() => {
        v.currentTime = 0;
        v.play().catch(() => {});
        fadingOutRef.current = false;
        fadeTo(1, FADE_MS);
      }, 100);
    };

    // Pause when scrolled offscreen to save battery/CPU on phones.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(v);

    v.addEventListener('loadeddata', onLoaded);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnded);
    // If the browser already buffered a frame before this effect ran (fast
    // connections / cached), `loadeddata` won't fire again — fade in now so the
    // video never stays stuck invisible.
    if (v.readyState >= 2) onLoaded();
    return () => {
      cancelAnimationFrame(rafRef.current);
      io.disconnect();
      v.removeEventListener('loadeddata', onLoaded);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('ended', onEnded);
    };
  }, [fadeTo]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop={false}
      playsInline
      preload={eager ? 'auto' : 'metadata'}
      className={className}
      style={{ opacity: 0, ...style }}
    />
  );
}
