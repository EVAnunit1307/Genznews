import { useState } from 'react';
import { TOPICS } from '../config';

// topic id (URL-ish) → article category (Title-case in the content schema)
const TOPIC_TO_CATEGORY: Record<string, string> = {
  global: 'Global',
  us: 'US',
  canada: 'Canada',
  climate: 'Climate',
  tech: 'Tech',
  money: 'Money',
  culture: 'Culture',
  policy: 'Policy',
  fashion: 'Fashion',
};

/**
 * Client filter for the home feed. Cards are server-rendered (SEO / zero-JS
 * content); this island only toggles their visibility by category.
 */
export default function TopicFilter() {
  const [active, setActive] = useState('all');

  const pick = (id: string) => {
    setActive(id);
    const cat = TOPIC_TO_CATEGORY[id];
    let visible = 0;
    document.querySelectorAll<HTMLElement>('[data-article-card]').forEach((el) => {
      const show = id === 'all' || el.dataset.category === cat;
      el.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    const empty = document.querySelector<HTMLElement>('[data-feed-empty]');
    if (empty) empty.style.display = visible === 0 ? '' : 'none';
  };

  return (
    <div
      className="liquid-glass rounded-full p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full"
      role="tablist"
      aria-label="Filter by topic"
    >
      {TOPICS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => pick(t.id)}
          className={`shrink-0 inline-flex items-center justify-center rounded-full px-4 text-sm font-body whitespace-nowrap tap transition-colors ${
            active === t.id ? 'bg-white text-black font-medium' : 'text-white/85 hover:text-white'
          }`}
          style={{ minHeight: 44 }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
