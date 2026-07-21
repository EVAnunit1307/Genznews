import { useEffect, useState } from 'react';

interface Props {
  slug: string;
}

// The reaction set — expressive but on-brand for an ideas/politics read.
// KEEP IN SYNC with api/reactions.ts and src/components/SocialProof.astro.
const REACTIONS: { id: string; emoji: string; label: string }[] = [
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'facts', emoji: '💯', label: 'Facts' },
  { id: 'mind', emoji: '🤯', label: 'Whoa' },
  { id: 'eyes', emoji: '👀', label: 'Watching' },
  { id: 'respect', emoji: '🫡', label: 'Respect' },
];

type Counts = Record<string, number>;

/**
 * Multi-emoji reactions backed by /api/reactions (Upstash Redis). Visitors can
 * add any mix of reactions; each is toggleable and remembered per-device via
 * localStorage. Optimistic UI, and degrades gracefully when the API isn't
 * reachable (e.g. local preview) — never crashes, just keeps local state.
 */
export default function Reactions({ slug }: Props) {
  const [counts, setCounts] = useState<Counts>({});
  const [mine, setMine] = useState<Record<string, boolean>>({});
  const storeKey = `react:${slug}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) || '[]');
      if (Array.isArray(saved)) {
        const m: Record<string, boolean> = {};
        saved.forEach((id: string) => (m[id] = true));
        setMine(m);
      }
    } catch {
      /* ignore malformed storage */
    }

    fetch(`/api/reactions?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && d.counts) setCounts(d.counts);
      })
      .catch(() => {
        /* offline preview — keep empty counts */
      });
  }, [slug]);

  const persist = (m: Record<string, boolean>) => {
    try {
      localStorage.setItem(storeKey, JSON.stringify(Object.keys(m).filter((k) => m[k])));
    } catch {
      /* storage blocked — non-fatal */
    }
  };

  const toggle = (id: string) => {
    const active = !!mine[id];
    const delta = active ? -1 : 1;

    // optimistic
    const nextMine = { ...mine, [id]: !active };
    setMine(nextMine);
    persist(nextMine);
    setCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + delta) }));

    fetch(`/api/reactions?slug=${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, delta }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && d.counts) setCounts(d.counts);
      })
      .catch(() => {
        /* keep the optimistic value */
      });
  };

  const total = REACTIONS.reduce((s, r) => s + (counts[r.id] ?? 0), 0);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {REACTIONS.map((r) => {
          const n = counts[r.id] ?? 0;
          const active = !!mine[r.id];
          return (
            <button
              key={r.id}
              onClick={() => toggle(r.id)}
              aria-pressed={active}
              aria-label={`${r.label}${n ? ` — ${n}` : ''}`}
              className={`reaction-chip tap inline-flex items-center gap-1.5 rounded-full px-3.5 ${
                active ? 'reaction-chip--on' : ''
              }`}
              style={{ minHeight: 44 }}
            >
              <span className="reaction-emoji text-lg leading-none" aria-hidden="true">
                {r.emoji}
              </span>
              <span className="text-sm font-body tabular-nums text-white/85">
                {n > 0 ? n : r.label}
              </span>
            </button>
          );
        })}
      </div>
      {total > 0 && (
        <p className="mt-3 text-center text-[11px] text-white/45 font-body">
          {total} {total === 1 ? 'reaction' : 'reactions'} so far
        </p>
      )}
    </div>
  );
}
