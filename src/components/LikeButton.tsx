import { useEffect, useState } from 'react';

interface Props {
  slug: string;
}

/**
 * Like button backed by /api/like (Upstash Redis). One like per visitor,
 * enforced client-side via localStorage. Degrades gracefully when the API
 * isn't reachable (e.g. local preview) — optimistic UI, no crash.
 */
export default function LikeButton({ slug }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLiked(localStorage.getItem(`liked:${slug}`) === '1');
    fetch(`/api/like?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.likes === 'number') setCount(d.likes);
      })
      .catch(() => {
        /* keep null → shows just "Like" */
      });
  }, [slug]);

  const like = async () => {
    if (liked || busy) return;
    setBusy(true);
    setLiked(true);
    setCount((c) => (c ?? 0) + 1); // optimistic
    localStorage.setItem(`liked:${slug}`, '1');
    try {
      const r = await fetch(`/api/like?slug=${encodeURIComponent(slug)}`, { method: 'POST' });
      if (r.ok) {
        const d = await r.json();
        if (typeof d.likes === 'number') setCount(d.likes);
      }
    } catch {
      /* keep optimistic value */
    }
    setBusy(false);
  };

  return (
    <button
      onClick={like}
      disabled={liked}
      aria-pressed={liked}
      aria-label={liked ? 'You liked this article' : 'Like this article'}
      className={`liquid-glass rounded-full px-5 inline-flex items-center gap-2 tap transition-colors ${
        liked ? 'text-live' : 'text-white/80'
      }`}
      style={{ minHeight: 48 }}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 1 0-7.8 7.8l1.1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
      <span className="text-sm font-body">
        {liked ? 'Liked' : 'Like'}
        {count !== null ? ` · ${count}` : ''}
      </span>
    </button>
  );
}
