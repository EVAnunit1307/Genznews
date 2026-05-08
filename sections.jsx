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

// ───────────────────────── AUTH MODAL ─────────────────────────
const AuthModal = ({ open, onClose, onSuccess }) => {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) { setError(""); setEmail(""); setPassword(""); setUsername(""); }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const data = tab === "login"
        ? await loginUser(email, password)
        : await registerUser(email, password, username);
      localStorage.setItem("genzthinks_token", data.access_token);
      localStorage.setItem("genzthinks_user", JSON.stringify(data.user));
      onSuccess(data.user);
      onClose();
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }
    setLoading(false);
  };

  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(24px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="liquid-glass rounded-[1.75rem] p-8 w-full max-w-[360px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-7">
          <span className="font-heading italic text-white text-3xl tracking-[-1px]">genzthinks</span>
          <p className="text-[12px] text-white/45 font-body mt-1">
            {tab === "login" ? "Welcome back." : "Join 84,000 readers."}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="liquid-glass rounded-full p-1 flex mb-6">
          {[["login", "Sign in"], ["register", "Create account"]].map(([id, label]) => (
            <button key={id} onClick={() => { setTab(id); setError(""); }}
              className="relative flex-1 py-1.5 text-sm font-body rounded-full">
              {tab === id && (
                <motion.div layoutId="authTab" className="absolute inset-0 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className={`relative ${tab === id ? "text-black font-medium" : "text-white/60"}`}>{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {tab === "register" && (
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Username (optional)"
              className="w-full bg-white/[0.06] text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm font-body outline-none focus:bg-white/10 transition-colors" />
          )}
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-white/[0.06] text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm font-body outline-none focus:bg-white/10 transition-colors" />
          <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password (8+ characters)"
            className="w-full bg-white/[0.06] text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm font-body outline-none focus:bg-white/10 transition-colors" />

          {error && <p className="text-[12px] text-[#ff8a8a] font-body px-1">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-white text-black rounded-xl py-3 text-sm font-medium font-body disabled:opacity-55 mt-1">
            {loading ? "…" : tab === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-[11px] text-white/30 font-body text-center">
          {tab === "login" ? "No account? " : "Already a member? "}
          <button onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); }}
            className="text-white/55 hover:text-white transition-colors">
            {tab === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
};

// ───────────────────────── NAVBAR ─────────────────────────
const Navbar = ({ onSearchOpen, user, onAuthOpen, onLogout }) => {
  const links = ["Today", "Global", "Voices", "Pitch"];
  const displayName = user ? (user.username || user.email?.split("@")[0] || "You") : null;
  return (
    <motion.div
      initial={{ filter: "blur(10px)", opacity: 0, y: -10 }}
      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
      className="fixed top-4 left-0 right-0 z-50 px-6 lg:px-12 flex items-center justify-between"
    >
      <div className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center shrink-0">
        <span className="font-heading italic text-white text-2xl leading-none -mt-0.5">g</span>
      </div>
      <div className="hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1.5">
        {links.map((l) => (
          <a key={l} href="#" className="px-3 py-2 text-sm font-medium text-white/90 font-body whitespace-nowrap">{l}</a>
        ))}
        {user ? (
          <>
            <div className="ml-1 flex items-center gap-2 px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-xs font-heading italic text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-white/90 font-body">{displayName}</span>
            </div>
            <button onClick={onLogout}
              className="ml-1 px-3 py-2 text-sm text-white/50 font-body hover:text-white transition-colors">
              Sign out
            </button>
          </>
        ) : (
          <>
            <button onClick={onAuthOpen}
              className="px-3 py-2 text-sm font-medium text-white/90 font-body whitespace-nowrap">
              Sign in
            </button>
            <a href="#write" className="ml-1 inline-flex items-center gap-1.5 bg-white text-black rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap">
              Write a piece <ArrowUpRight className="h-4 w-4" />
            </a>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onSearchOpen}
          className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center shrink-0 hover:bg-white/5 transition-colors">
          <Search className="h-4 w-4 text-white" />
        </button>
        {!user && (
          <button onClick={onAuthOpen} className="md:hidden liquid-glass rounded-full px-3.5 py-2 text-xs font-medium text-white whitespace-nowrap">
            Sign in
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ───────────────────────── HERO ─────────────────────────
const Hero = ({ onSearchOpen, user, onAuthOpen, onLogout }) => {
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
        <Navbar onSearchOpen={onSearchOpen} user={user} onAuthOpen={onAuthOpen} onLogout={onLogout} />

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
            genzthinks is a newsroom and an open journal — original reporting on the issues shaping our generation, and a place for anyone with something to say to publish it well.
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
          className="relative px-4 py-1.5 text-sm font-body whitespace-nowrap rounded-full"
        >
          {active === t.id && (
            <motion.div
              layoutId="topicActive"
              className="absolute inset-0 bg-white rounded-full"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <span className={`relative ${active === t.id ? "text-black font-medium" : "text-white/85 hover:text-white"}`}>
            {t.label}
          </span>
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
                <div className="text-sm text-white font-body">{a.author || "genzthinks"}</div>
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
const SOURCE_LABEL = { guardian: "The Guardian", nytimes: "NY Times", newsapi: "NewsAPI", seed: "genzthinks", genzthinks: "genzthinks", hypebeast: "Hypebeast", vogue: "Vogue" };

const StoryCard = ({ a, i }) => {
  const [imgErr, setImgErr] = useState(false);
  const dek = stripHtml(a.dek || "");
  const color = cardColor(i);
  const isOriginal = a.source === "seed" || a.source === "genzthinks";
  const authorDisplay = a.author || SOURCE_LABEL[a.source] || "genzthinks";
  const catInitial = (a.category || "G").charAt(0).toUpperCase();

  return (
    <BlurReveal delay={0.035 * i}>
      <a
        href={a.url || "#"}
        target={a.url && a.url !== "#" ? "_blank" : undefined}
        rel="noreferrer"
        className="group flex items-start gap-4 py-5 border-b border-white/[0.07] hover:bg-white/[0.03] -mx-3 px-3 rounded-xl transition-colors"
      >
        {/* Text column */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 min-h-[4.5rem]">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] uppercase tracking-[0.16em] font-body font-semibold"
              style={{ color: `oklch(0.72 0.14 ${color})` }}
            >
              {a.category || "Global"}
            </span>
            {isOriginal && (
              <span className="rounded-full px-2 py-0.5 text-[9px] font-body uppercase tracking-wider"
                style={{ background: `oklch(0.22 0.06 ${color})`, color: `oklch(0.78 0.12 ${color})` }}>
                genzthinks original
              </span>
            )}
            <span className="text-[10px] text-white/30 font-body">{relativeTime(a.published_at)}</span>
          </div>

          <h3 className="font-heading italic text-white text-xl md:text-[1.35rem] tracking-[-0.4px] leading-[1.1] group-hover:text-white/85 transition-colors line-clamp-3">
            {a.title}
          </h3>

          {dek && (
            <p className="text-[12.5px] text-white/45 font-body font-light leading-relaxed line-clamp-2">{dek}</p>
          )}

          <div className="flex items-center gap-2 mt-auto pt-1 text-[11px] text-white/35 font-body">
            <span className="text-white/50 font-medium truncate max-w-[160px]">{authorDisplay}</span>
            <span className="text-white/20">·</span>
            <span>{a.read_time || 5} min read</span>
            {a.views > 0 && (
              <>
                <span className="text-white/20">·</span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {a.views >= 1000 ? `${(a.views / 1000).toFixed(1)}K` : a.views}
                </span>
              </>
            )}
            <ArrowUpRight className="h-3 w-3 ml-auto text-white/20 group-hover:text-white/55 transition-colors shrink-0" />
          </div>
        </div>

        {/* Thumbnail */}
        <div className="shrink-0 w-[4.5rem] h-[4.5rem] md:w-[5.5rem] md:h-[5rem] rounded-[0.75rem] overflow-hidden mt-0.5 flex items-center justify-center"
          style={!(a.image_url && !imgErr) ? { background: `linear-gradient(145deg, oklch(0.28 0.09 ${color}) 0%, oklch(0.16 0.04 ${color}) 100%)` } : {}}>
          {a.image_url && !imgErr ? (
            <img
              src={a.image_url}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgErr(true)}
            />
          ) : (
            <span
              className="font-heading italic text-2xl select-none"
              style={{ color: `oklch(0.55 0.14 ${color})` }}
            >
              {catInitial}
            </span>
          )}
        </div>
      </a>
    </BlurReveal>
  );
};

const MostRead = () => {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    fetchTrending().then(setTrending);
  }, []);

  const items = (trending.length ? trending : MOCK_STORIES).slice(0, 5);

  return (
    <BlurReveal>
      <div className="liquid-glass rounded-[1.25rem] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/55 font-body">Trending now</div>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d2d] animate-pulse" />
        </div>
        <ol className="space-y-3">
          {items.map((a, i) => (
            <li key={a.id || i}>
              <a href={a.url || "#"} target={a.url && a.url !== "#" ? "_blank" : undefined} rel="noreferrer"
                className="group flex items-start gap-3">
                <span className="font-heading italic text-white/25 text-2xl leading-none w-7 shrink-0 group-hover:text-white/50 transition-colors">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-white/35 font-body mb-0.5">{a.category}</div>
                  <div className="text-[13px] text-white/80 font-body leading-snug group-hover:text-white transition-colors line-clamp-2">
                    {a.title}
                  </div>
                  <div className="text-[10px] text-white/30 font-body mt-1">{a.read_time} min · {relativeTime(a.published_at)}</div>
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
  const [state, setState] = useState("idle"); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");
    const ok = await subscribeNewsletter(email);
    setState(ok ? "success" : "error");
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

        {state === "success" && (
          <div className="text-sm text-white font-body inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9eff8e]" /> See you tomorrow at 7.
          </div>
        )}

        {state === "error" && (
          <div className="space-y-3">
            <div className="text-sm text-white/60 font-body inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff6b6b]" /> Couldn't subscribe — backend may be offline.
            </div>
            <button onClick={() => setState("idle")} className="text-xs text-white/40 font-body hover:text-white/70">
              Try again
            </button>
          </div>
        )}

        {(state === "idle" || state === "loading") && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              className="flex-1 min-w-0 bg-white/5 text-white placeholder-white/35 rounded-full px-4 py-2 text-sm font-body outline-none focus:bg-white/10 transition-colors"
            />
            <button type="submit" disabled={state === "loading"}
              className="bg-white text-black rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap inline-flex items-center gap-1.5 disabled:opacity-60">
              {state === "loading" ? "…" : <><span>Subscribe</span><ArrowUpRight className="h-3.5 w-3.5" /></>}
            </button>
          </form>
        )}
      </div>
    </BlurReveal>
  );
};

const FEED_PAGE = 5;

const StoryGrid = ({ active }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shown, setShown] = useState(FEED_PAGE);
  const topicLabel = TOPICS.find(t => t.id === active)?.label || "All";

  useEffect(() => {
    setLoading(true);
    setShown(FEED_PAGE);
    fetchArticles(active, 20).then(data => {
      setArticles(Array.isArray(data) && data.length ? data : MOCK_STORIES);
      setLoading(false);
    });
  }, [active]);

  const list = articles.length ? articles : MOCK_STORIES;
  const visible = list.slice(0, shown);
  const remaining = list.length - shown;

  return (
    <section className="relative bg-black px-6 md:px-12 lg:px-20 pb-24 pt-4">
      <div className="max-w-7xl mx-auto">
        <BlurReveal>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <h2 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
                {active === "all" ? "Today's feed" : topicLabel}
              </h2>
              {loading && <span className="text-xs text-white/30 font-body">Loading…</span>}
            </div>
            <span className="text-[11px] text-white/35 font-body inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d2d] animate-pulse" />
              {list.length} stories
            </span>
          </div>
        </BlurReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12">
          <div className="lg:col-span-8">
            {visible.map((a, i) => <StoryCard key={a.id || i} a={a} i={i} />)}

            {remaining > 0 && (
              <button
                onClick={() => setShown(s => s + FEED_PAGE)}
                className="w-full py-5 mt-1 flex items-center justify-center gap-2 text-sm text-white/45 font-body hover:text-white transition-colors border-t border-white/[0.07] group"
              >
                <span>{remaining} more stor{remaining === 1 ? "y" : "ies"}</span>
                <span className="liquid-glass rounded-full w-6 h-6 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                </span>
              </button>
            )}
            {remaining <= 0 && list.length > FEED_PAGE && (
              <div className="py-4 text-center text-[11px] text-white/25 font-body border-t border-white/[0.07] mt-1">
                You're caught up.
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start mt-8 lg:mt-0">
            <MostRead />
            <NewsletterMini />
          </aside>
        </div>
      </div>
    </section>
  );
};

// ───────────────────────── VOICES ─────────────────────────
const AVATAR_HUES = ["260", "320", "180", "30", "150", "200", "280", "60"];

const VoiceCard = ({ o, i }) => {
  const hue = AVATAR_HUES[i % AVATAR_HUES.length];
  const initials = (o.author_name || "").split(" ").map(n => n[0]).slice(0, 2).join("");
  const likes = o.likes ?? 0;
  return (
    <BlurReveal delay={0.05 * i}>
      <a href="#" className="liquid-glass rounded-[1.25rem] p-6 flex flex-col h-full group hover:bg-white/[0.03] transition-colors">
        {/* Author row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-[13px] font-heading italic font-bold"
              style={{ background: `oklch(0.72 0.16 ${hue})`, color: `oklch(0.18 0.04 ${hue})` }}
            >
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-sm text-white font-body font-medium leading-snug">{o.author_name}</div>
              <div className="text-[11px] text-white/45 font-body">{o.author_role}</div>
            </div>
          </div>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); }}
            className="liquid-glass rounded-full px-3 py-1.5 text-[11px] text-white/70 font-body hover:text-white transition-colors whitespace-nowrap"
          >
            + Follow
          </button>
        </div>

        {/* Tag + read */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-body uppercase tracking-[0.14em]"
            style={{ background: `oklch(0.25 0.06 ${hue})`, color: `oklch(0.80 0.12 ${hue})` }}
          >
            {o.tag}
          </span>
          <span className="text-[10px] text-white/35 font-body">{o.read_time || 5} min read</span>
        </div>

        {/* Title */}
        <h3 className="font-heading italic text-white text-[1.55rem] md:text-[1.65rem] tracking-[-0.5px] leading-[1.06] mb-3 group-hover:text-white/90 transition-colors">
          {o.title}
        </h3>

        {/* Excerpt */}
        <p className="text-[13px] text-white/60 font-body font-light leading-relaxed flex-1 line-clamp-3">
          {o.excerpt}
        </p>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-white/35 font-body">
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              {likes.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Comment className="h-3.5 w-3.5" />
              {Math.floor(likes / 7).toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-white/45 font-body group-hover:text-white/80 transition-colors inline-flex items-center gap-1">
            Continue reading <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </a>
    </BlurReveal>
  );
};

const Voices = () => {
  const [opinions, setOpinions] = useState([]);

  useEffect(() => {
    fetchOpinions().then(data => {
      setOpinions(Array.isArray(data) ? data : MOCK_OPINIONS);
    });
  }, []);

  const list = opinions.length ? opinions : MOCK_OPINIONS;
  const [featured, ...rest] = list;

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      <FadingVideo src={SECONDARY_VIDEO} className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.65) 100%)" }} />
      <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-24 pb-16 flex flex-col min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          <BlurReveal>
            <div className="flex items-center gap-3 mb-5">
              <div className="text-sm font-body text-white/60">// VOICES</div>
              <div className="liquid-glass rounded-full px-3 py-1 text-[10px] text-white/60 font-body uppercase tracking-wider">
                {list.length} writers this week
              </div>
            </div>
          </BlurReveal>
          <BlurReveal delay={0.05}>
            <h2 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]">
              Open<br/>journalism
            </h2>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <p className="mt-6 text-white/80 font-body font-light max-w-xl text-base leading-relaxed">
              Anyone with rigor and a point of view can publish on genzthinks. Editor-reviewed, royalty-shared, free forever. Below — this week's most-read voices.
            </p>
          </BlurReveal>

          {/* Featured voice — full-width card */}
          {featured && (
            <BlurReveal delay={0.15} className="mt-12">
              <a href="#" className="liquid-glass rounded-[1.5rem] p-7 md:p-10 block group hover:bg-white/[0.03] transition-colors">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex items-center gap-3 md:w-56 shrink-0">
                    <div
                      className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-lg font-heading italic font-bold"
                      style={{ background: `oklch(0.72 0.16 ${AVATAR_HUES[0]})`, color: `oklch(0.18 0.04 ${AVATAR_HUES[0]})` }}
                    >
                      {(featured.author_name || "").split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="text-sm text-white font-body font-medium">{featured.author_name}</div>
                      <div className="text-[11px] text-white/45 font-body">{featured.author_role}</div>
                      <div className="mt-2">
                        <button onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                          className="liquid-glass rounded-full px-3 py-1 text-[10px] text-white/70 font-body hover:text-white transition-colors">
                          + Follow
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-body uppercase tracking-[0.14em]"
                        style={{ background: `oklch(0.25 0.06 ${AVATAR_HUES[0]})`, color: `oklch(0.80 0.12 ${AVATAR_HUES[0]})` }}>
                        {featured.tag}
                      </span>
                      <span className="text-[10px] text-white/35 font-body">Featured · {featured.read_time || 5} min</span>
                    </div>
                    <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-[1.04] mb-3 group-hover:text-white/90 transition-colors">
                      {featured.title}
                    </h3>
                    <p className="text-sm text-white/65 font-body font-light leading-relaxed max-w-2xl">
                      {featured.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-[11px] text-white/40 font-body">
                      <span className="inline-flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" />{(featured.likes ?? 0).toLocaleString()}</span>
                      <span className="inline-flex items-center gap-1.5"><Comment className="h-3.5 w-3.5" />{Math.floor((featured.likes ?? 0) / 7).toLocaleString()}</span>
                      <span className="ml-auto text-white/55 group-hover:text-white/80 transition-colors inline-flex items-center gap-1">
                        Continue reading <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </BlurReveal>
          )}

          {/* Rest of voices grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {rest.map((o, i) => <VoiceCard key={o.id} o={o} i={i + 1} />)}
          </div>
        </div>
      </div>
    </section>
  );
};

// ───────────────────────── WRITE CTA ─────────────────────────
const DESKS = ["Policy", "Climate", "Tech", "Culture", "Money", "Global"];

const WriteCTA = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [desk, setDesk] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | submitting | under_review
  const saveTimer = useRef(null);

  const autosave = (t, b, d) => {
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const data = await saveDraft({ title: t || undefined, body: b, desk: d, session_id: "anon-" + Date.now() }, draftId);
      if (data?.id) setDraftId(data.id);
      setSaveStatus("saved");
    }, 1200);
  };

  const handleTitle = (v) => { setTitle(v); autosave(v, body, desk); };
  const handleBody = (v) => { setBody(v); autosave(title, v, desk); };
  const handleDesk = (d) => { setDesk(d); autosave(title, body, d); };

  const handleSubmit = async () => {
    if (!body.trim() || submitStatus !== "idle") return;
    setSubmitStatus("submitting");
    let id = draftId;
    if (!id) {
      const data = await saveDraft({ title: title || undefined, body, desk });
      id = data?.id;
    }
    if (id) {
      await submitDraft(id);
      setSubmitStatus("under_review");
    } else {
      setSubmitStatus("idle");
    }
  };

  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const canSubmit = body.trim().length > 50 && submitStatus === "idle";

  if (submitStatus === "under_review") {
    return (
      <section id="write" className="relative bg-black px-6 md:px-12 lg:px-20 py-24">
        <div className="max-w-3xl mx-auto">
          <BlurReveal>
            <div className="liquid-glass rounded-[2rem] p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, oklch(0.55 0.15 280 / 0.3), transparent 60%)" }} />
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-body mb-5">// UNDER REVIEW</div>
              <h2 className="font-heading italic text-white text-4xl md:text-5xl tracking-[-1.5px] leading-[1] mb-4">
                {title ? `"${title}"` : "Your piece is in."}
              </h2>
              <p className="text-white/60 font-body text-base leading-relaxed max-w-md mx-auto mb-8">
                A genzthinks editor will read it and get back to you within 48 hours. If it's a fit, we'll schedule it and handle editing together.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-[12px] text-white/35 font-body mb-8">
                <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#9eff8e]" /> Saved to drafts</span>
                <span>·</span>
                <span>{words} words · {desk || "no desk selected"}</span>
              </div>
              <button onClick={() => { setTitle(""); setBody(""); setDesk(null); setDraftId(null); setSaveStatus("idle"); setSubmitStatus("idle"); }}
                className="liquid-glass rounded-full px-5 py-2.5 text-sm text-white/70 font-body hover:text-white transition-colors">
                Start another piece
              </button>
            </div>
          </BlurReveal>
        </div>
      </section>
    );
  }

  return (
    <section id="write" className="relative bg-black px-6 md:px-12 lg:px-20 py-24">
      <div className="max-w-3xl mx-auto">
        <BlurReveal>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-body mb-5">// WRITE FOR GENZTHINKS</div>
        </BlurReveal>
        <BlurReveal delay={0.05}>
          <h2 className="font-heading italic text-white text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-[-2px] mb-3">
            Have something<br />to say?
          </h2>
        </BlurReveal>
        <BlurReveal delay={0.08}>
          <p className="text-white/55 font-body font-light text-base leading-relaxed mb-10 max-w-lg">
            Write it here. Editors review every submission — if it's a fit, we publish it together. No follower count required.
          </p>
        </BlurReveal>

        <BlurReveal delay={0.12}>
          {/* Editor card */}
          <div className="liquid-glass rounded-[1.5rem] overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <span className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] text-white/60 font-body uppercase tracking-wider">
                  {saveStatus === "saving" ? "saving…" : saveStatus === "saved" ? "draft saved ✓" : "new draft"}
                </span>
                {words > 0 && <span className="text-[10px] text-white/30 font-body">{words} words</span>}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {DESKS.map((d) => (
                  <button key={d} onClick={() => handleDesk(desk === d ? null : d)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-body uppercase tracking-wider transition-colors ${desk === d ? "bg-white text-black" : "liquid-glass text-white/55 hover:text-white"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Title input */}
            <div className="px-6 pt-6 pb-2">
              <input
                type="text"
                value={title}
                onChange={e => handleTitle(e.target.value)}
                placeholder="Give it a title…"
                className="w-full bg-transparent text-white placeholder-white/25 font-heading italic text-2xl md:text-3xl tracking-[-0.5px] leading-tight outline-none"
              />
            </div>

            {/* Body textarea */}
            <div className="px-6 pb-5">
              <textarea
                rows={7}
                value={body}
                onChange={e => handleBody(e.target.value)}
                placeholder="The first sentence is the hardest. Try: 'I have spent the last year watching…'"
                className="w-full bg-transparent text-white/85 placeholder-white/25 font-body text-base leading-relaxed resize-none outline-none"
              />
            </div>
            {/* Footer bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.07]">
              <div className="text-[11px] text-white/30 font-body">
                {words > 0 ? `~${Math.max(1, Math.ceil(words / 220))} min read` : "Start writing to see read time"}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="bg-white text-black rounded-full px-5 py-2 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-35 transition-opacity"
                >
                  {submitStatus === "submitting" ? "Submitting…" : <>Submit for review <ArrowUpRight className="h-3.5 w-3.5" /></>}
                </button>
              </div>
            </div>
          </div>
        </BlurReveal>

        <BlurReveal delay={0.16}>
          <p className="mt-4 text-[11px] text-white/30 font-body">
            Every piece is editor-reviewed before publishing. We respond within 48 hours. No follower count, no paywall.
          </p>
        </BlurReveal>
      </div>
    </section>
  );
};

// ───────────────────────── MISSION + FOUNDER ─────────────────────────
const MissionSection = () => (
  <section className="relative bg-black px-6 md:px-12 lg:px-20 py-24 border-t border-white/[0.06]">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        {/* Left — manifesto */}
        <div>
          <BlurReveal>
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-body mb-6">// OUR MISSION</div>
          </BlurReveal>
          <BlurReveal delay={0.05}>
            <h2 className="font-heading italic text-white text-5xl md:text-[3.8rem] tracking-[-2px] leading-[0.93] mb-8">
              News built for the generation that has to fix everything.
            </h2>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <div className="space-y-5 text-white/60 font-body font-light text-base leading-relaxed max-w-lg">
              <p>
                genzthinks started with a simple frustration: the news wasn't written for us. It was written <em>about</em> us, at best. A statistic. A demographic. A generation to be analyzed by people who wouldn't have to live with the results.
              </p>
              <p>
                We built something different. Original reporting on the policy, climate, tech, fashion, and culture stories that actually shape Gen Z lives — written by the people living them. And an open platform for anyone with something real to say.
              </p>
              <p className="text-white/45">Independent. No VC. No algorithm. Reader-funded.</p>
            </div>
          </BlurReveal>

          <BlurReveal delay={0.15} className="mt-10">
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.08]">
              {[
                { n: "84K", l: "readers under 30" },
                { n: "48h", l: "editor response" },
                { n: "100%", l: "open archived" },
              ].map(({ n, l }) => (
                <div key={n}>
                  <div className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px]">{n}</div>
                  <div className="text-[11px] text-white/35 font-body mt-1.5 leading-snug">{l}</div>
                </div>
              ))}
            </div>
          </BlurReveal>
        </div>

        {/* Right — founder */}
        <BlurReveal delay={0.12}>
          <div className="liquid-glass rounded-[1.5rem] p-8 md:p-10">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-body mb-7">// FOUNDER</div>
            <div className="flex items-start gap-5 mb-7">
              <div
                className="w-[4.5rem] h-[4.5rem] rounded-full shrink-0 flex items-center justify-center text-xl font-heading italic font-bold"
                style={{ background: "oklch(0.72 0.17 320)", color: "oklch(0.16 0.04 320)" }}
              >
                DM
              </div>
              <div className="pt-1">
                <div className="font-heading italic text-white text-2xl md:text-3xl tracking-[-0.5px] leading-none mb-1">
                  Donya Mirian
                </div>
                <div className="text-[12px] text-white/45 font-body">Founder & Editor-in-Chief</div>
              </div>
            </div>

            <blockquote className="text-[15px] text-white/70 font-body font-light leading-relaxed mb-7 border-l-2 border-white/15 pl-4">
              "I built genzthinks because I was tired of reading news that treated my generation like a problem to be solved. We're not a demographic. We're the people who have to actually live in the world these decisions create — so we should be the ones writing about it."
            </blockquote>

            <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-white/[0.08]">
              <span
                className="rounded-full px-3 py-1.5 text-[11px] font-body"
                style={{ background: "oklch(0.22 0.06 320)", color: "oklch(0.78 0.14 320)" }}
              >
                genzthinks · Toronto
              </span>
              <a href="#write"
                className="text-[12px] text-white/45 font-body hover:text-white transition-colors inline-flex items-center gap-1">
                Write for us <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </BlurReveal>
      </div>
    </div>
  </section>
);

// ───────────────────────── FOOTER ─────────────────────────
const Footer = () => (
  <footer className="relative bg-black px-6 md:px-12 lg:px-20 pt-16 pb-12 border-t border-white/10">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center">
              <span className="font-heading italic text-white text-xl leading-none -mt-0.5">g</span>
            </div>
            <span className="font-heading italic text-white text-2xl">genzthinks</span>
          </div>
          <p className="text-sm text-white/60 font-body font-light max-w-xs leading-relaxed">A newsroom and an open journal for the generation living through it. Independent. Reader-funded. Open archived.</p>
        </div>
        {[
          { h: "Read", l: ["Today", "Global", "US", "Canada", "Voices"] },
          { h: "Write", l: ["Pitch a piece", "Editor desks", "Style guide", "Royalties"] },
          { h: "genzthinks", l: ["Mission", "Masthead", "Press", "Contact"] },
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
        <span>© 2026 genzthinks media · Toronto / Lagos / Berlin</span>
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
  AuthModal, SearchDrawer, Navbar, Hero, TopicNav, Featured, StoryGrid, Voices,
  MissionSection, WriteCTA, Footer, MobileTabBar, ProgressBar,
});
