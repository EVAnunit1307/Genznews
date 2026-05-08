// Main sections — all wired to live API with graceful fallback
const HERO_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4";
const SECONDARY_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4";

// ───────────────────────── SEARCH DRAWER ─────────────────────────
const SearchDrawer = ({ open, onClose }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
    else { setQ(""); setResults(null); }
  }, [open]);

  useEffect(() => {
    if (!q || q.length < 2) { setResults(null); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const data = await searchContent(q);
      setResults(data);
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex flex-col"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}
    >
      <div className="flex items-center gap-4 px-6 md:px-12 pt-6 pb-4 border-b border-white/10">
        <Search className="h-5 w-5 text-white/50 shrink-0" />
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search articles, voices, topics…"
          className="flex-1 bg-transparent text-white text-xl font-body outline-none placeholder-white/30"
        />
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm font-body px-3 py-1.5 liquid-glass rounded-full">
          esc
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-6">
        {loading && (
          <div className="text-white/40 text-sm font-body">Searching…</div>
        )}
        {results && !loading && (
          <>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-body mb-6">
              {results.total} result{results.total !== 1 ? "s" : ""} for "{q}"
            </div>

            {results.articles.length > 0 && (
              <div className="mb-8">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-body mb-4">Articles</div>
                <div className="space-y-3">
                  {results.articles.map(a => (
                    <a key={a.id} href={a.url} target="_blank" rel="noreferrer"
                      className="flex items-start gap-4 group p-3 liquid-glass rounded-[1rem]">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-body mb-1">{a.region} · {a.category}</div>
                        <div className="text-base text-white font-heading italic leading-snug group-hover:text-white/80">{a.title}</div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-white/30 group-hover:text-white shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {results.opinions.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-body mb-4">Voices</div>
                <div className="space-y-3">
                  {results.opinions.map(o => (
                    <a key={o.id} href="#" className="flex items-start gap-4 group p-3 liquid-glass rounded-[1rem]">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-body mb-1">{o.tag} · {o.author_name}</div>
                        <div className="text-base text-white font-heading italic leading-snug group-hover:text-white/80">{o.title}</div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-white/30 group-hover:text-white shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {results.total === 0 && (
              <div className="text-white/40 text-sm font-body">No results found. Try a different term.</div>
            )}
          </>
        )}
        {!results && !loading && q.length < 2 && (
          <div className="text-white/25 text-sm font-body">Start typing to search across all articles and voices.</div>
        )}
      </div>
    </motion.div>
  );
};

// ───────────────────────── NAVBAR ─────────────────────────
const Navbar = ({ onSearchOpen }) => {
  const links = ["Today", "Global", "Voices", "Pitch", "Sign in"];
  return (
    <motion.div
      initial={{ filter: "blur(10px)", opacity: 0, y: -10 }}
      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
      className="fixed top-4 left-0 right-0 z-50 px-6 lg:px-12 flex items-center justify-between"
    >
      <div className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center shrink-0">
        <span className="font-heading italic text-white text-2xl leading-none -mt-0.5">a</span>
      </div>
      <div className="hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1.5">
        {links.map((l) => (
          <a key={l} href="#" className="px-3 py-2 text-sm font-medium text-white/90 font-body whitespace-nowrap">{l}</a>
        ))}
        <a href="#write" className="ml-1 inline-flex items-center gap-1.5 bg-white text-black rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap">
          Write a piece <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSearchOpen}
          className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center shrink-0 hover:bg-white/5 transition-colors"
        >
          <Search className="h-4 w-4 text-white" />
        </button>
        <a href="#write" className="md:hidden bg-white text-black rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap inline-flex items-center gap-1">
          Write <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
};

// ───────────────────────── HERO ─────────────────────────
const Hero = ({ onSearchOpen }) => {
  const [ticker, setTicker] = useState([]);

  useEffect(() => {
    fetchTicker().then(setTicker);
  }, []);

  const tickerText = ticker.length ? ticker.join("") + ticker.join("") : "";

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col">
      <FadingVideo
        src={HERO_VIDEO}
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
        style={{ width: "120%", height: "120%" }}
      />
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)" }} />

      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
        <Navbar onSearchOpen={onSearchOpen} />

        <div className="flex-1 flex flex-col items-center justify-center pt-24 px-4">
          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="liquid-glass rounded-full inline-flex items-center gap-2 pl-1 pr-3 py-1"
          >
            <span className="bg-[#ff2d2d] text-white px-2.5 py-1 text-[10px] font-semibold rounded-full tracking-wider inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
            </span>
            <span className="text-sm text-white/90 font-body">Senate AI Regulation vote — tonight 8:00pm ET</span>
          </motion.div>

          <BlurText
            text="The news, written by the people living it"
            className="mt-6 text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.88] max-w-4xl tracking-[-2px] md:tracking-[-3px] text-center px-2"
          />

          <motion.p
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
            className="mt-5 text-sm md:text-base text-white/85 max-w-xl font-body font-light leading-snug text-center px-2"
          >
            axis is a newsroom and an open journal — original reporting on the issues shaping our generation, and a place for anyone with something to say to publish it well.
          </motion.p>

          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 1.1, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-7"
          >
            <a href="#feed" className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white inline-flex items-center gap-2">
              Read today's edition <ArrowUpRight className="h-5 w-5" />
            </a>
            <a href="#write" className="text-white text-sm font-body font-medium inline-flex items-center gap-2">
              <Pen className="h-4 w-4" /> Publish your piece
            </a>
          </motion.div>
        </div>

        {/* Live ticker */}
        {tickerText && (
          <div className="relative z-10 overflow-hidden border-t border-white/10 py-2.5">
            <div
              className="whitespace-nowrap text-[11px] text-white/50 font-body"
              style={{ animation: "tickerScroll 30s linear infinite", display: "inline-block" }}
            >
              {tickerText}
            </div>
          </div>
        )}

        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 1.3, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 pb-10 px-4 text-xs text-white/60 font-body"
        >
          <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#ff2d2d] animate-pulse" /> Edition · Wed, May 7 · 04:12 ET</span>
          <span className="hidden md:inline opacity-40">/</span>
          <span>Reporting from Lagos · Toronto · Berlin · Manila · São Paulo</span>
        </motion.div>
      </div>
    </section>
  );
};

// ───────────────────────── TOPIC NAV ─────────────────────────
const TopicNav = ({ active, setActive }) => (
  <div className="relative z-40 px-4 md:px-8 pt-12 pb-2 flex justify-center">
    <div className="liquid-glass rounded-full p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full" style={{ scrollbarWidth: "none" }}>
      {TOPICS.map((t) => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          className={`px-4 py-1.5 text-sm font-body whitespace-nowrap rounded-full transition-colors ${
            active === t.id ? "bg-white text-black font-medium" : "text-white/85 hover:text-white"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  </div>
);

// ───────────────────────── FEATURED ─────────────────────────
const Featured = () => {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    fetchFeatured().then(setArticle);
  }, []);

  const a = article || MOCK_FEATURED;

  return (
    <section id="feed" className="relative bg-black px-6 md:px-12 lg:px-20 pt-10 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <BlurReveal className="lg:col-span-7" delay={0.05}>
            <a href={a.url || "#"} target={a.url && a.url !== "#" ? "_blank" : undefined} rel="noreferrer"
              className="liquid-glass rounded-[1.5rem] block overflow-hidden h-full min-h-[420px] lg:min-h-[560px] relative group">
              {a.image_url ? (
                <img src={a.image_url} alt={a.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.32 0.08 260) 0%, oklch(0.18 0.04 280) 60%, oklch(0.12 0.02 290) 100%)" }} />
              )}
              <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18), transparent 55%)" }} />
              <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
                <defs>
                  <pattern id="stripes" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="white" strokeWidth="0.4" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#stripes)" />
              </svg>
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                <div className="liquid-glass rounded-full px-3 py-1 text-[11px] font-body text-white inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d2d] animate-pulse" />
                  <span className="text-[#ff8a8a]">Live</span> <span className="text-white/70">· lead story</span>
                </div>
                <div className="liquid-glass rounded-full w-9 h-9 flex items-center justify-center text-white">
                  <Bookmark className="h-4 w-4" />
                </div>
              </div>
              <div className="absolute bottom-5 left-5 right-5">
                <div className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/80 font-body inline-block">
                  {a.source === "seed" ? "[photo: voters at city hall]" : a.source}
                </div>
              </div>
            </a>
          </BlurReveal>

          <BlurReveal className="lg:col-span-5 flex flex-col justify-center" delay={0.15}>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/55 font-body mb-5">
              {a.region} · {a.category} · {new Date(a.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
            <h2 className="font-heading italic text-white text-4xl md:text-5xl lg:text-[3.6rem] leading-[0.95] tracking-[-2px]">
              {a.title}
            </h2>

            <div className="mt-7 liquid-glass rounded-[1rem] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/55 font-body">The short of it</div>
                <button className="text-[10px] uppercase tracking-wider text-white/60 font-body hover:text-white inline-flex items-center gap-1">
                  <Play className="h-3 w-3" /> {a.read_time}:00
                </button>
              </div>
              <p className="text-sm text-white/85 font-body font-light leading-snug">{a.dek || "Read the full story for the details."}</p>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <div className="w-10 h-10 liquid-glass rounded-full flex items-center justify-center text-white font-heading italic">
                {(a.author || "A").charAt(0)}
              </div>
              <div className="leading-tight">
                <div className="text-sm text-white font-body">{a.author || "axis"}</div>
                <div className="text-xs text-white/55 font-body">{a.read_time} min read · {relativeTime(a.published_at)}</div>
              </div>
              <a href={a.url || "#"} target={a.url && a.url !== "#" ? "_blank" : undefined} rel="noreferrer"
                className="ml-auto liquid-glass-strong rounded-full px-4 py-2 text-sm text-white font-medium inline-flex items-center gap-2 whitespace-nowrap">
                Read <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </BlurReveal>
        </div>
      </div>
    </section>
  );
};

// ───────────────────────── STORY GRID ─────────────────────────
const StoryCard = ({ a, i }) => (
  <BlurReveal delay={0.05 * i}>
    <a href={a.url || "#"} target={a.url && a.url !== "#" ? "_blank" : undefined} rel="noreferrer" className="group block">
      <div className="relative rounded-[1rem] overflow-hidden aspect-[16/10] mb-4">
        {a.image_url ? (
          <img src={a.image_url} alt={a.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, oklch(0.36 0.10 ${cardColor(i)}) 0%, oklch(0.16 0.04 ${cardColor(i)}) 100%)` }} />
        )}
        <svg className="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="none">
          <defs>
            <pattern id={`p${i}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="4" stroke="white" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#p${i})`} />
        </svg>
        <div className="absolute top-3 left-3">
          <span className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] text-white/90 font-body uppercase tracking-[0.15em]">{a.category}</span>
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-body mb-2">{a.region} · {relativeTime(a.published_at)}</div>
      <h3 className="font-heading italic text-white text-2xl md:text-[1.7rem] tracking-[-0.5px] leading-[1.02] group-hover:text-white">
        {a.title}
      </h3>
      <div className="mt-3 text-xs text-white/55 font-body">{a.author} · {a.read_time} min</div>
    </a>
  </BlurReveal>
);

const MostRead = () => {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    fetchTrending().then(setTrending);
  }, []);

  const items = trending.length ? trending : MOCK_STORIES.slice(0, 5);

  return (
    <BlurReveal>
      <div className="liquid-glass rounded-[1.25rem] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/55 font-body">Most read · this hour</div>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d2d] animate-pulse" />
        </div>
        <ol className="space-y-4">
          {items.slice(0, 5).map((a, i) => (
            <li key={a.id}>
              <a href={a.url || "#"} target={a.url && a.url !== "#" ? "_blank" : undefined} rel="noreferrer" className="group flex items-start gap-4">
                <span className="font-heading italic text-white/30 text-3xl leading-none w-8 shrink-0 group-hover:text-white/60 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-white/45 font-body mb-1">{a.region} · {a.category}</div>
                  <div className="text-sm text-white font-body font-medium leading-snug group-hover:text-white">{a.title}</div>
                </div>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </BlurReveal>
  );
};

const NewsletterMini = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await subscribeNewsletter(email);
    setSent(true);
    setLoading(false);
  };

  return (
    <BlurReveal delay={0.1}>
      <div className="liquid-glass rounded-[1.25rem] p-6">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/55 font-body mb-3">The morning brief</div>
        <h4 className="font-heading italic text-white text-2xl tracking-[-0.5px] leading-[1.05] mb-2">
          Five stories that matter, in your inbox at 7am.
        </h4>
        <p className="text-xs text-white/55 font-body font-light leading-relaxed mb-5">
          Hand-picked by the desks. No autoplay, no algorithm. 84,000 readers under 30.
        </p>
        {!sent ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              className="flex-1 min-w-0 bg-white/5 text-white placeholder-white/35 rounded-full px-4 py-2 text-sm font-body outline-none focus:bg-white/10 transition-colors"
            />
            <button type="submit" disabled={loading}
              className="bg-white text-black rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap inline-flex items-center gap-1.5 disabled:opacity-60">
              {loading ? "…" : <><span>Subscribe</span><ArrowUpRight className="h-3.5 w-3.5" /></>}
            </button>
          </form>
        ) : (
          <div className="text-sm text-white font-body inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9eff8e]" /> See you tomorrow at 7.
          </div>
        )}
      </div>
    </BlurReveal>
  );
};

const StoryGrid = ({ active }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchArticles(active).then(data => {
      setArticles(Array.isArray(data) ? data : MOCK_STORIES);
      setLoading(false);
    });
  }, [active]);

  const list = articles.length ? articles : MOCK_STORIES;

  return (
    <section className="relative bg-black px-6 md:px-12 lg:px-20 pb-24 pt-4">
      <div className="max-w-7xl mx-auto">
        <BlurReveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-body mb-2">// today's edition</div>
              <h2 className="font-heading italic text-white text-4xl md:text-5xl tracking-[-1.5px] leading-none">What's moving today</h2>
            </div>
            <span className="text-xs text-white/45 font-body inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d2d] animate-pulse" />
              {loading ? "Loading…" : `${list.length} stories · live`}
            </span>
          </div>
        </BlurReveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-14">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {list.map((a, i) => <StoryCard key={a.id} a={a} i={i} />)}
          </div>
          <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
            <MostRead />
            <NewsletterMini />
          </aside>
        </div>
      </div>
    </section>
  );
};

// ───────────────────────── VOICES ─────────────────────────
const VoiceCard = ({ o, i }) => (
  <BlurReveal delay={0.05 * i}>
    <a href="#" className="liquid-glass rounded-[1.25rem] p-7 flex flex-col h-full min-h-[280px] group">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-body mb-5">{o.tag} · {o.read_time} min</div>
      <h3 className="font-heading italic text-white text-2xl md:text-3xl tracking-[-0.5px] leading-[1.05] mb-4">{o.title}</h3>
      <p className="text-sm text-white/70 font-body font-light leading-relaxed">"{o.excerpt}"</p>
      <div className="mt-auto pt-6 flex items-center gap-3">
        <div className="w-9 h-9 liquid-glass rounded-full flex items-center justify-center text-white font-heading italic">
          {o.author_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
        </div>
        <div className="leading-tight">
          <div className="text-xs text-white font-body">{o.author_name}</div>
          <div className="text-[11px] text-white/45 font-body">{o.author_role}</div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-white/40">
          <Heart className="h-3.5 w-3.5" />
          <span className="text-[11px] font-body">{o.likes?.toLocaleString()}</span>
        </div>
      </div>
    </a>
  </BlurReveal>
);

const Voices = () => {
  const [opinions, setOpinions] = useState([]);

  useEffect(() => {
    fetchOpinions().then(data => {
      setOpinions(Array.isArray(data) ? data : MOCK_OPINIONS);
    });
  }, []);

  const list = opinions.length ? opinions : MOCK_OPINIONS;

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      <FadingVideo src={SECONDARY_VIDEO} className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.65) 100%)" }} />
      <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-24 pb-16 flex flex-col min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          <BlurReveal>
            <div className="text-sm font-body text-white/80 mb-5">// VOICES</div>
          </BlurReveal>
          <BlurReveal delay={0.05}>
            <h2 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]">
              Open<br/>journalism
            </h2>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <p className="mt-6 text-white/85 font-body font-light max-w-xl text-base leading-relaxed">
              Anyone with rigor and a point of view can publish on axis. Editor-reviewed, royalty-shared, archived to the open web. Below — this week's most-read essays.
            </p>
          </BlurReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-14">
            {list.map((o, i) => <VoiceCard key={o.id} o={o} i={i} />)}
          </div>
        </div>
      </div>
    </section>
  );
};

// ───────────────────────── WRITE CTA ─────────────────────────
const WriteCTA = () => {
  const [draft, setDraft] = useState("");
  const [desk, setDesk] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | submitted
  const saveTimer = useRef(null);

  const handleChange = (val) => {
    setDraft(val);
    setStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const data = await saveDraft({ body: val, desk, session_id: "anon-" + Date.now() }, draftId);
      if (data?.id) setDraftId(data.id);
      setStatus("saved");
    }, 1200);
  };

  const handleSubmit = async () => {
    if (!draftId) {
      const data = await saveDraft({ body: draft, desk });
      if (data?.id) {
        await submitDraft(data.id);
        setStatus("submitted");
      }
    } else {
      await submitDraft(draftId);
      setStatus("submitted");
    }
  };

  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const grade = Math.max(7, Math.min(12, 7 + Math.floor(draft.length / 80)));
  const readMin = words ? Math.max(1, Math.ceil(words / 220)) : 0;

  return (
    <section id="write" className="relative bg-black px-6 md:px-12 lg:px-20 py-24">
      <div className="max-w-5xl mx-auto liquid-glass rounded-[2rem] p-8 md:p-14 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, oklch(0.55 0.15 280 / 0.35), transparent 60%)" }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, oklch(0.55 0.15 200 / 0.25), transparent 60%)" }} />

        <BlurReveal><div className="text-sm font-body text-white/65 mb-4">// PUBLISH WITH AXIS</div></BlurReveal>
        <BlurReveal delay={0.05}>
          <h2 className="font-heading italic text-white text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-[-2px] max-w-3xl">
            Have something to say about this moment?
          </h2>
        </BlurReveal>
        <BlurReveal delay={0.1}>
          <p className="mt-6 text-white/80 font-body font-light text-base max-w-xl leading-relaxed">
            Pitch an essay, a long read, an op-ed. Editors get back within 48 hours. Your draft starts here — keep typing and we'll autosave.
          </p>
        </BlurReveal>

        <BlurReveal delay={0.15}>
          <div className="mt-9 liquid-glass rounded-[1.25rem] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] text-white/80 font-body uppercase tracking-wider">draft</span>
                <span className="text-[11px] text-white/55 font-body">
                  {status === "saving" ? "saving…" : status === "saved" ? "autosaved ✓" : status === "submitted" ? "submitted ✓" : `${words} words`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {["Policy", "Climate", "Tech", "Culture"].map((t) => (
                  <button key={t} onClick={() => setDesk(desk === t ? null : t)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-body uppercase tracking-wider transition-colors ${desk === t ? "bg-white text-black" : "liquid-glass text-white/80 hover:text-white"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {status === "submitted" ? (
              <div className="py-8 text-center">
                <div className="text-white font-heading italic text-3xl mb-2">Pitch received.</div>
                <div className="text-white/55 font-body text-sm">An editor will reach out within 48 hours.</div>
              </div>
            ) : (
              <textarea
                rows={5}
                value={draft}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="The first sentence is the hardest. Try: 'I have spent the last year watching…'"
                className="w-full bg-transparent text-white placeholder-white/40 font-heading italic text-2xl md:text-3xl tracking-[-0.5px] leading-tight resize-none outline-none"
              />
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="text-[11px] text-white/55 font-body">Grade {grade} · {readMin} min read</div>
              <div className="flex items-center gap-3">
                <button className="text-xs text-white/80 font-body hover:text-white">Save & finish later</button>
                <button onClick={handleSubmit} disabled={!draft.trim() || status === "submitted"}
                  className="liquid-glass-strong rounded-full px-4 py-2 text-sm text-white font-medium inline-flex items-center gap-2 disabled:opacity-50">
                  Submit pitch <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </BlurReveal>

        <BlurReveal delay={0.2}>
          <div className="mt-6 text-[11px] text-white/55 font-body">Editor matched in 48h · royalty-shared · open archived · no paywall</div>
        </BlurReveal>
      </div>
    </section>
  );
};

// ───────────────────────── FOOTER ─────────────────────────
const Footer = () => (
  <footer className="relative bg-black px-6 md:px-12 lg:px-20 pt-16 pb-12 border-t border-white/10">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center">
              <span className="font-heading italic text-white text-xl leading-none -mt-0.5">a</span>
            </div>
            <span className="font-heading italic text-white text-2xl">axis</span>
          </div>
          <p className="text-sm text-white/60 font-body font-light max-w-xs leading-relaxed">A newsroom and an open journal for the generation living through it. Independent. Reader-funded. Open archived.</p>
        </div>
        {[
          { h: "Read", l: ["Today", "Global", "US", "Canada", "Voices"] },
          { h: "Write", l: ["Pitch a piece", "Editor desks", "Style guide", "Royalties"] },
          { h: "axis", l: ["Mission", "Masthead", "Press", "Contact"] },
        ].map((c) => (
          <div key={c.h}>
            <div className="text-xs uppercase tracking-wider text-white/45 font-body mb-3">{c.h}</div>
            <ul className="space-y-2">
              {c.l.map((x) => (
                <li key={x}><a href="#" className="text-sm text-white/85 font-body hover:text-white">{x}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/45 font-body">
        <span>© 2026 axis media co-op · Toronto / Lagos / Berlin</span>
        <span>v1.0 · last edition built {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  </footer>
);

// ───────────────────────── MOBILE TAB BAR ─────────────────────────
const MobileTabBar = ({ onSearchOpen }) => {
  const [active, setActive] = useState("today");
  const Item = ({ id, label, icon, primary, onClick }) => (
    <button
      onClick={() => { setActive(id); onClick?.(); }}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-full transition-colors ${
        primary ? "bg-white text-black" : active === id ? "text-white" : "text-white/55"
      }`}
    >
      <span className={primary ? "text-black" : ""}>{icon}</span>
      <span className="text-[10px] font-body font-medium tracking-wide">{label}</span>
    </button>
  );
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
      className="md:hidden fixed bottom-3 left-3 right-3 z-50"
    >
      <div className="liquid-glass-strong rounded-full px-2 py-1.5 flex items-center justify-around">
        <Item id="today" label="Today" icon={<Globe className="h-5 w-5" />} />
        <Item id="voices" label="Voices" icon={<Pen className="h-5 w-5" />} />
        <Item id="pitch" label="Pitch" primary icon={<ArrowUpRight className="h-5 w-5" />} />
        <Item id="search" label="Search" icon={<Search className="h-5 w-5" />} onClick={onSearchOpen} />
        <Item id="profile" label="You" icon={<Spark className="h-5 w-5" />} />
      </div>
    </motion.div>
  );
};

// ───────────────────────── READING PROGRESS BAR ─────────────────────────
const ProgressBar = () => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const tick = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight) || 0;
      setP(Math.min(1, Math.max(0, scrolled)));
    };
    window.addEventListener("scroll", tick, { passive: true });
    tick();
    return () => window.removeEventListener("scroll", tick);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-white/5">
      <div className="h-full bg-[#ff2d2d]" style={{ width: `${p * 100}%`, transition: "width 80ms linear" }} />
    </div>
  );
};

Object.assign(window, {
  SearchDrawer, Navbar, Hero, TopicNav, Featured, StoryGrid, Voices, WriteCTA,
  Footer, MobileTabBar, ProgressBar,
});
