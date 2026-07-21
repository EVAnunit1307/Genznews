import { useEffect, useRef, useState, type FormEvent } from 'react';
import { relativeTime } from '../lib/format';

interface Props {
  slug: string;
}

interface Comment {
  id: string;
  name: string;
  body: string;
  ts: number;
  pending?: boolean;
}

const NAME_KEY = 'cmt-name';
const MOD_KEY = 'cmt-mod';
const BODY_MAX = 1500;

/**
 * First-party comments — anyone can post with just a name (no account, no
 * GitHub). Backed by /api/comments (Upstash Redis). Optimistic posting, name
 * remembered per-device, and a quiet moderator unlock for the writer. Degrades
 * gracefully when the API isn't reachable (e.g. local preview): the thread just
 * stays empty and posting shows a friendly notice.
 */
export default function Comments({ slug }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [notice, setNotice] = useState('');
  const [modToken, setModToken] = useState('');
  const website = useRef<HTMLInputElement>(null); // honeypot

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) || '');
      setModToken(localStorage.getItem(MOD_KEY) || '');
    } catch {
      /* storage blocked — non-fatal */
    }

    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.comments)) setComments(d.comments);
      })
      .catch(() => {
        /* offline preview — leave empty */
      })
      .finally(() => setLoaded(true));
  }, [slug]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (text.length < 2 || posting) return;
    if (website.current?.value) return; // bot filled the honeypot

    const display = name.trim().slice(0, 40) || 'Anonymous';
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {
      /* ignore */
    }

    // Optimistic: show it immediately as pending, reconcile on response.
    const tempId = `tmp-${Date.now()}`;
    const optimistic: Comment = { id: tempId, name: display, body: text, ts: Date.now(), pending: true };
    setComments((c) => [optimistic, ...c]);
    setBody('');
    setNotice('');
    setPosting(true);

    try {
      const r = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: display, body: text, website: '' }),
      });
      const d = await r.json().catch(() => null);
      if (r.ok && d?.comment) {
        setComments((c) => c.map((x) => (x.id === tempId ? d.comment : x)));
      } else {
        setComments((c) => c.filter((x) => x.id !== tempId));
        setBody(text); // let them retry without retyping
        setNotice(d?.error || "Couldn't post that just now.");
      }
    } catch {
      setComments((c) => c.filter((x) => x.id !== tempId));
      setBody(text);
      setNotice('Comments are warming up — try again on the live site.');
    } finally {
      setPosting(false);
    }
  };

  const toggleMod = () => {
    if (modToken) {
      if (confirm('Sign out of moderator mode on this device?')) {
        setModToken('');
        try {
          localStorage.removeItem(MOD_KEY);
        } catch {
          /* ignore */
        }
      }
      return;
    }
    const t = prompt('Moderator token');
    if (!t) return;
    setModToken(t.trim());
    try {
      localStorage.setItem(MOD_KEY, t.trim());
    } catch {
      /* ignore */
    }
  };

  const remove = async (id: string) => {
    if (!modToken || !confirm('Delete this comment?')) return;
    const prev = comments;
    setComments((c) => c.filter((x) => x.id !== id));
    try {
      const r = await fetch(
        `/api/comments?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(id)}`,
        { method: 'DELETE', headers: { 'x-mod-token': modToken } }
      );
      if (!r.ok) {
        setComments(prev); // restore on failure
        if (r.status === 403) {
          setModToken('');
          try {
            localStorage.removeItem(MOD_KEY);
          } catch {
            /* ignore */
          }
          alert('That moderator token was rejected.');
        } else if (r.status === 501) {
          alert('Set COMMENTS_ADMIN_TOKEN in Vercel to enable deletion.');
        }
      }
    } catch {
      setComments(prev);
    }
  };

  const count = comments.filter((c) => !c.pending).length;
  const remaining = BODY_MAX - body.length;

  return (
    <section id="comments" className="mt-14 pt-10 border-t border-white/10">
      <div className="flex items-center justify-between mb-5">
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/55 font-body">
          Comments
          {loaded && count > 0 && <span className="text-white/80"> · {count}</span>}
        </div>
        <button
          type="button"
          onClick={toggleMod}
          aria-label={modToken ? 'Moderator mode on' : 'Moderator tools'}
          title={modToken ? 'Moderator mode on' : 'Moderator tools'}
          className="tap text-xs leading-none transition-opacity"
          style={{ opacity: modToken ? 0.85 : 0.28 }}
        >
          {modToken ? '🔓' : '🔒'}
        </button>
      </div>

      {/* compose — no login, just a name + a take */}
      <form onSubmit={submit} className="mb-8">
        <input
          type="text"
          value={name}
          onChange={(e) => setName((e.target as HTMLInputElement).value)}
          placeholder="Your name (optional)"
          aria-label="Your name"
          maxLength={40}
          className="comment-input w-full px-4 mb-2 font-body"
          style={{ minHeight: 44, fontSize: 16 }}
        />
        {/* honeypot — hidden from humans, catches bots */}
        <input
          ref={website}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody((e.target as HTMLTextAreaElement).value.slice(0, BODY_MAX))}
          placeholder="Add to the conversation…"
          aria-label="Your comment"
          rows={3}
          className="comment-input w-full px-4 py-3 font-body resize-y"
          style={{ fontSize: 16, minHeight: 88 }}
        />
        <div className="flex items-center justify-between mt-2">
          <span
            className="text-[11px] font-body tabular-nums"
            style={{ color: remaining < 100 ? 'rgba(255,180,80,0.9)' : 'rgba(255,255,255,0.35)' }}
            aria-live="polite"
          >
            {body.length > 0 ? `${remaining} left` : 'Be kind. Be real.'}
          </span>
          <button
            type="submit"
            disabled={posting || body.trim().length < 2}
            className="bg-white text-black rounded-full px-5 text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-40 tap"
            style={{ minHeight: 44 }}
          >
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
        {notice && (
          <p className="mt-2 text-[13px] text-white/60 font-body inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff6b6b' }} />
            {notice}
          </p>
        )}
      </form>

      {/* thread */}
      {loaded && count === 0 && (
        <p className="text-sm text-white/45 font-body">
          No comments yet — start the conversation.
        </p>
      )}

      <ul className="space-y-3">
        {comments.map((c) => (
          <li
            key={c.id}
            className="comment-card px-4 py-3"
            style={{ opacity: c.pending ? 0.55 : 1 }}
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-body text-white/90 font-medium">{c.name}</span>
              <span className="text-[11px] font-body text-white/40">
                {c.pending ? 'posting…' : relativeTime(new Date(c.ts))}
              </span>
              {modToken && !c.pending && (
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  aria-label="Delete comment"
                  className="ml-auto text-[11px] text-white/40 hover:text-white/80 tap"
                >
                  Delete
                </button>
              )}
            </div>
            <p
              className="text-[15px] font-body text-white/75 leading-relaxed"
              style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
            >
              {c.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
