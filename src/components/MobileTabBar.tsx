interface Props {
  latestSlug?: string;
}

const iconProps = {
  className: 'h-5 w-5',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/**
 * Floating mobile bottom tab bar. Every item is a real anchor that navigates
 * (section 13). Honors the home indicator via the `.bottom-safe` inset.
 */
export default function MobileTabBar(_props: Props) {
  const items: Array<{
    label: string;
    href: string;
    icon: any;
    primary?: boolean;
    search?: boolean;
  }> = [
    {
      label: 'Today',
      href: '#top',
      icon: (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
      ),
    },
    {
      label: 'Read',
      href: '#feed',
      icon: (
        <svg {...iconProps}>
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
    {
      label: 'Search',
      href: '#',
      search: true,
      primary: true,
      icon: (
        <svg {...iconProps}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      ),
    },
    {
      label: 'About',
      href: '#about',
      icon: (
        <svg {...iconProps}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="md:hidden fixed left-3 right-3 z-50 bottom-safe" aria-label="Primary">
      <div className="liquid-glass-strong rounded-full px-2 py-1.5 flex items-center justify-around">
        {items.map((it) => (
          <a
            key={it.label}
            href={it.href}
            data-open-search={it.search ? '' : undefined}
            className={`flex flex-col items-center justify-center gap-1 px-3 rounded-full tap ${
              it.primary ? 'bg-white text-black' : 'text-white/70'
            }`}
            style={{ minHeight: 44, minWidth: 44 }}
          >
            {it.icon}
            <span className="text-[10px] font-body font-medium tracking-wide">{it.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
