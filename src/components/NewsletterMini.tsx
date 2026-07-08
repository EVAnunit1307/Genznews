import { useState, type FormEvent } from 'react';

type State = 'idle' | 'loading' | 'success' | 'error';

/** Email capture. Posts to /api/newsletter (Buttondown proxy, wired in Phase 4). */
export default function NewsletterMini() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || state === 'loading') return;
    setState('loading');
    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setState(r.ok ? 'success' : 'error');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="liquid-glass rounded-[1.25rem] p-6">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/55 font-body mb-3">
        The newsletter
      </div>
      <h4 className="font-heading italic text-white text-2xl tracking-[-0.5px] leading-[1.05] mb-2">
        One email, only when it's worth it.
      </h4>
      <p className="text-sm text-white/55 font-body font-light leading-relaxed mb-5">
        When I publish something I couldn't stop thinking about, you'll get it. No spam, no
        algorithm, unsubscribe anytime.
      </p>

      {state === 'success' && (
        <div className="text-sm text-white font-body inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: '#7CFFB2' }} /> You're in. Talk
          soon.
        </div>
      )}

      {state === 'error' && (
        <div className="space-y-3">
          <div className="text-sm text-white/60 font-body inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: '#ff6b6b' }} /> Couldn't
            subscribe just now.
          </div>
          <button
            onClick={() => setState('idle')}
            className="text-xs text-white/40 font-body hover:text-white/70 tap"
          >
            Try again
          </button>
        </div>
      )}

      {(state === 'idle' || state === 'loading') && (
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            aria-label="Email address"
            className="flex-1 min-w-0 bg-white/5 text-white placeholder-white/35 rounded-full px-4 font-body outline-none focus:bg-white/10 transition-colors"
            style={{ minHeight: 44, fontSize: 16 }}
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            className="bg-white text-black rounded-full px-4 text-sm font-medium whitespace-nowrap inline-flex items-center gap-1.5 disabled:opacity-60 tap"
            style={{ minHeight: 44 }}
          >
            {state === 'loading' ? '…' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  );
}
