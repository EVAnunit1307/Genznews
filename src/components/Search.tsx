import { useEffect, useRef, useState } from 'react';

interface Result {
  url: string;
  title: string;
  excerpt: string;
}

type Status = 'idle' | 'loading' | 'done' | 'unavailable';

/**
 * Full-screen search overlay powered by Pagefind (static index built into
 * /pagefind at build time). Opens via any [data-open-search] element, the
 * `open-search` event, or the "/" and Cmd/Ctrl+K shortcuts.
 */
export default function Search() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const pf = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number>(0);

  useEffect(() => {
    const openIt = () => setOpen(true);
    const onClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement)?.closest?.('[data-open-search]');
      if (t) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea/i.test((e.target as HTMLElement)?.tagName || '');
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('open-search', openIt);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('open-search', openIt);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const loadPagefind = async () => {
    if (pf.current) return pf.current;
    try {
      // Runtime-only URL so the bundler leaves this as a true dynamic import
      // (the /pagefind index only exists in the built output).
      const url = `${window.location.origin}/pagefind/pagefind.js`;
      const mod = await import(/* @vite-ignore */ url);
      pf.current = mod;
      return mod;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => inputRef.current?.focus(), 50);
      void loadPagefind(); // warm up the WASM index while the user types
    } else {
      document.body.style.overflow = '';
      setQ('');
      setResults([]);
      setStatus('idle');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    window.clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      setStatus('idle');
      return;
    }
    timer.current = window.setTimeout(async () => {
      setStatus('loading');
      const lib = await loadPagefind();
      if (!lib) {
        setStatus('unavailable');
        return;
      }
      const search = await lib.search(q);
      if (!search) {
        setStatus('done');
        setResults([]);
        return;
      }
      const data = await Promise.all(search.results.slice(0, 6).map((r: any) => r.data()));
      setResults(
        data.map((d: any) => ({
          url: d.url,
          title: d.meta?.title || 'Untitled',
          excerpt: d.excerpt as string,
        }))
      );
      setStatus('done');
    }, 250);
  }, [q, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center gap-4 px-6 md:px-12 pt-6 pb-4 border-b border-white/10">
        <svg
          className="h-5 w-5 text-white/50 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          value={q}
          onInput={(e: any) => setQ(e.currentTarget.value)}
          placeholder="Search articles…"
          aria-label="Search articles"
          className="flex-1 bg-transparent text-white font-body outline-none placeholder-white/30"
          style={{ fontSize: 18 }}
        />
        <button
          onClick={() => setOpen(false)}
          className="text-white/70 text-sm font-body px-3 liquid-glass rounded-full tap"
          style={{ minHeight: 40 }}
        >
          esc
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-6">
        {status === 'loading' && <div className="text-white/45 text-sm font-body">Searching…</div>}
        {status === 'unavailable' && (
          <div className="text-white/45 text-sm font-body">
            Search runs on the deployed site (the index is built at deploy time).
          </div>
        )}
        {status === 'done' && results.length === 0 && q.trim().length >= 2 && (
          <div className="text-white/45 text-sm font-body">No results for “{q}”.</div>
        )}
        {q.trim().length < 2 && (
          <div className="text-white/30 text-sm font-body">Type to search across every article.</div>
        )}

        <div className="space-y-3 max-w-2xl mt-2">
          {results.map((r) => (
            <a key={r.url} href={r.url} className="block p-4 liquid-glass rounded-[1rem] group tap">
              <div className="font-heading text-white text-lg leading-snug group-hover:text-white/85 transition-colors">
                {r.title}
              </div>
              <div
                className="text-[13px] text-white/55 font-body mt-1 leading-relaxed search-excerpt"
                dangerouslySetInnerHTML={{ __html: r.excerpt }}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
