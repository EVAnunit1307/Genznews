import { useState } from 'react';

interface Props {
  title: string;
  url: string;
}

/**
 * Native Web Share on mobile (the iOS/Android share sheet), with a
 * copy-to-clipboard fallback on desktop browsers that lack navigator.share.
 */
export default function ShareButton({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user dismissed the sheet — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — nothing else we can do gracefully
    }
  };

  return (
    <button
      onClick={share}
      aria-label="Share this article"
      className="liquid-glass rounded-full px-4 text-sm font-body text-white/90 inline-flex items-center gap-2 active:scale-95 transition-transform"
      style={{ minHeight: 44 }}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? 'Link copied' : 'Share'}
    </button>
  );
}
