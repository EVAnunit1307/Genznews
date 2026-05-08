// Data layer — three-tier strategy:
//   1. Backend API  (when AXIS_CONFIG.API_BASE is set)
//   2. Direct browser calls to Guardian + NYT  (CORS-open, no backend needed)
//   3. Mock data  (always available as final fallback)

const CFG = window.AXIS_CONFIG || {};
const API_BASE = CFG.API_BASE || "";
const GUARDIAN_KEY = CFG.GUARDIAN_KEY || "test";
const NYTIMES_KEY = CFG.NYTIMES_KEY || "";

// ── Topic config ─────────────────────────────────────────────────────────────

const TOPICS = [
  { id: "all",     label: "All" },
  { id: "global",  label: "Global" },
  { id: "us",      label: "US" },
  { id: "canada",  label: "Canada" },
  { id: "climate", label: "Climate" },
  { id: "tech",    label: "Tech" },
  { id: "money",   label: "Money" },
  { id: "culture", label: "Culture" },
  { id: "policy",  label: "Policy" },
  { id: "fashion", label: "Fashion" },
];

// ── Guardian topic map ───────────────────────────────────────────────────────

const GUARDIAN_SECTIONS = {
  all: "news", global: "world", us: "us-news", canada: "world",
  climate: "environment", tech: "technology", money: "business",
  culture: "culture", policy: "politics", fashion: "fashion",
};

const TOPIC_CATEGORY = {
  all: "Global", global: "Global", us: "US", canada: "Canada",
  climate: "Climate", tech: "Tech", money: "Money",
  culture: "Culture", policy: "Policy", fashion: "Fashion",
};

// ── NY Times section map ─────────────────────────────────────────────────────

const NYT_SECTIONS = {
  all: "home", global: "world", us: "us", canada: "world",
  climate: "climate", tech: "technology", money: "business",
  culture: "arts", policy: "politics", fashion: "fashion",
};

// ── Mock fallbacks ────────────────────────────────────────────────────────────

const MOCK_FEATURED = {
  id: "mock-featured", source: "genzthinks", region: "Global", category: "Policy",
  title: "The first generation that voted on housing — and won",
  dek: "In four cities across three continents, voters under 30 just rewrote zoning law. We tracked the organizers, the group chats, and the grandparents who showed up.",
  author: "Maya Okafor", read_time: 12, views: 284000, url: "#",
  image_url: null, published_at: new Date().toISOString(),
};

const MOCK_STORIES = [
  { id: "1", region: "Global", category: "Climate", title: "Inside the youth-led carbon court suing six governments at once", dek: "A case filed by 19 plaintiffs — average age 22 — could redefine state liability.", author: "Theo Vance", read_time: 8, views: 0, url: "#", published_at: new Date(Date.now() - 7200000).toISOString(), source: "genzthinks" },
  { id: "2", region: "US", category: "Policy", title: "Why Gen Z congressional staffers are quietly rewriting the rules", dek: "24-year-old policy aides are shaping bills nobody is reading.", author: "Iris Han", read_time: 6, views: 0, url: "#", published_at: new Date(Date.now() - 18000000).toISOString(), source: "genzthinks" },
  { id: "3", region: "Canada", category: "Money", title: "Toronto's 'rent council' experiment is in its 18th month. Tenants are winning.", dek: "Co-tenant negotiation panels delivered 14% average reductions.", author: "Lena Park", read_time: 9, views: 0, url: "#", published_at: new Date(Date.now() - 86400000).toISOString(), source: "genzthinks" },
  { id: "4", region: "Global", category: "Tech", title: "The AI literacy curriculum that 312 high schools just adopted — overnight", dek: "Built by a 19-year-old in three weeks. We sat in on a class.", author: "Wren Adachi", read_time: 5, views: 0, url: "#", published_at: new Date(Date.now() - 28800000).toISOString(), source: "genzthinks" },
  { id: "5", region: "US", category: "Culture", title: "Group chats are the new newsroom. We mapped 40 of them.", dek: "A look inside the closed Discord servers where real-time city journalism is happening.", author: "Jordan Reyes", read_time: 11, views: 0, url: "#", published_at: new Date(Date.now() - 108000000).toISOString(), source: "genzthinks" },
  { id: "6", region: "Global", category: "Policy", title: "Voter turnout under 25 hit 71% in last week's local races. What changed?", dek: "Three boring policy fixes — and one TikTok account — rewrote the playbook.", author: "Sasha Bell", read_time: 7, views: 0, url: "#", published_at: new Date(Date.now() - 86400000).toISOString(), source: "genzthinks" },
  { id: "7", region: "Global", category: "Fashion", title: "The $40 sneaker that sold out in 11 minutes — and what that says about us", dek: "A limited collab between a Toronto art student and a no-name factory in Portugal broke every resale record this year.", author: "Zara Osei", read_time: 6, views: 0, url: "#", published_at: new Date(Date.now() - 14400000).toISOString(), source: "genzthinks" },
  { id: "8", region: "Global", category: "Fashion", title: "Vintage is not a trend. It's a rejection of the trend cycle itself.", dek: "Gen Z's secondhand obsession isn't nostalgia — it's the only ethical consumption left when everything new is fast fashion.", author: "Lila Nguyen", read_time: 5, views: 0, url: "#", published_at: new Date(Date.now() - 32400000).toISOString(), source: "genzthinks" },
  { id: "9", region: "Global", category: "Fashion", title: "Demna, Virgil, and the designers who made fashion feel urgent again", dek: "How a generation of outsider designers turned luxury into a conversation about who gets to belong.", author: "Theo Mensah", read_time: 8, views: 0, url: "#", published_at: new Date(Date.now() - 54000000).toISOString(), source: "genzthinks" },
];

const MOCK_OPINIONS = [
  { id: "o1", author_name: "Devi Subramanian", author_handle: "@devi", author_role: "Law student, Toronto", title: "We don't need new news. We need new permission.", excerpt: "The story Gen Z keeps not getting told is that we already know what's broken.", tag: "Media", read_time: 4, likes: 8421, created_at: new Date().toISOString() },
  { id: "o2", author_name: "Marcus Kline", author_handle: "@mk", author_role: "Climate organizer", title: "The carbon budget is a group project and we have one week left", excerpt: "The math doesn't math anymore. We need policy that admits that.", tag: "Climate", read_time: 6, likes: 12903, created_at: new Date().toISOString() },
  { id: "o3", author_name: "Yuna Park", author_handle: "@yuna", author_role: "Software engineer", title: "I built the AI tutor my 14-year-old sister actually uses. It's not what you think.", excerpt: "It doesn't write her essays. It refuses to. The most popular feature is \"explain like you're tired of me.\"", tag: "Tech", read_time: 5, likes: 6230, created_at: new Date().toISOString() },
  { id: "o4", author_name: "Andre Simons", author_handle: "@andre", author_role: "Public housing policy intern", title: "Housing is not complicated. We just refuse to build any.", excerpt: "I have read every zoning code in three provinces. The barrier isn't ideology, it's vibes.", tag: "Policy", read_time: 8, likes: 4118, created_at: new Date().toISOString() },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function _relativeTime(iso) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return "just now";
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return d === 1 ? "yesterday" : `${d}d ago`;
  } catch { return ""; }
}

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .trim();
}

const CARD_COLORS = ["260", "200", "150", "320", "30", "240", "180", "280"];
function cardColor(i) { return CARD_COLORS[i % CARD_COLORS.length]; }
function relativeTime(iso) { return _relativeTime(iso); }

// ── Tier 1: Backend API ──────────────────────────────────────────────────────

async function _backendFetch(path, fallback) {
  if (!API_BASE) return null;
  try {
    const r = await fetch(`${API_BASE}${path}`);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

// ── Tier 2: Guardian API (browser-safe, CORS open) ───────────────────────────

async function _guardianArticles(topic = "all", limit = 20) {
  const section = GUARDIAN_SECTIONS[topic] || "news";
  const category = TOPIC_CATEGORY[topic] || "Global";
  try {
    const url = new URL("https://content.guardianapis.com/search");
    url.searchParams.set("api-key", GUARDIAN_KEY);
    url.searchParams.set("section", section);
    url.searchParams.set("page-size", String(Math.min(limit, 50)));
    url.searchParams.set("order-by", "newest");
    url.searchParams.set("show-fields", "trailText,byline,thumbnail,wordcount");
    const r = await fetch(url.toString());
    if (!r.ok) return [];
    const items = (await r.json()).response?.results || [];
    return items.map((a, i) => {
      const fields = a.fields || {};
      const pub = a.webPublicationDate || new Date().toISOString();
      const wc = parseInt(fields.wordcount || 0);
      return {
        id: `guardian-${i}-${Date.now()}`,
        source: "guardian",
        title: a.webTitle || "",
        dek: (fields.trailText || "").replace(/<[^>]+>/g, ""),
        author: fields.byline || "",
        category,
        region: TOPIC_CATEGORY[topic] || "Global",
        url: a.webUrl || "#",
        image_url: fields.thumbnail || null,
        published_at: pub,
        read_time: wc ? Math.max(2, Math.ceil(wc / 200)) : 5,
        views: 0,
      };
    });
  } catch { return []; }
}

// ── Tier 2: NY Times API (browser-safe, CORS open) ───────────────────────────

async function _nytArticles(topic = "all", limit = 20) {
  if (!NYTIMES_KEY) return [];
  const section = NYT_SECTIONS[topic] || "home";
  const category = TOPIC_CATEGORY[topic] || "Global";
  try {
    const r = await fetch(
      `https://api.nytimes.com/svc/topstories/v2/${section}.json?api-key=${NYTIMES_KEY}`
    );
    if (!r.ok) return [];
    const items = ((await r.json()).results || []).slice(0, limit);
    return items
      .filter(a => a.title && a.url)
      .map((a, i) => {
        const multimedia = a.multimedia || [];
        const img = multimedia.find(m => m.format === "threeByTwoSmallAt2X")?.url
          || multimedia[0]?.url || null;
        const pub = a.published_date || new Date().toISOString();
        return {
          id: `nyt-${i}-${Date.now()}`,
          source: "nytimes",
          title: a.title || "",
          dek: a.abstract || "",
          author: (a.byline || "").replace(/^By /i, ""),
          category,
          region: TOPIC_CATEGORY[topic] || "Global",
          url: a.url || "#",
          image_url: img,
          published_at: pub,
          read_time: Math.max(2, Math.ceil((a.abstract || "").split(" ").length / 200) + 3),
          views: 0,
        };
      });
  } catch { return []; }
}

// Deduplicate articles by URL
function _dedupe(articles) {
  const seen = new Set();
  return articles.filter(a => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

async function fetchArticles(topic = "all", limit = 20) {
  // Try backend first
  const backend = await _backendFetch(`/articles?topic=${topic}&limit=${limit}`, null);
  if (backend && Array.isArray(backend) && backend.length) return backend;

  // Direct browser calls to Guardian + NYT in parallel
  const [guardian, nyt] = await Promise.all([
    _guardianArticles(topic, Math.ceil(limit * 0.6)),
    _nytArticles(topic, Math.ceil(limit * 0.6)),
  ]);
  const combined = _dedupe([...guardian, ...nyt])
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, limit);

  return combined.length ? combined : MOCK_STORIES;
}

async function fetchFeatured() {
  const backend = await _backendFetch("/articles/featured", null);
  if (backend) return backend;

  // Use top Guardian story as featured
  const [guardian] = await Promise.all([_guardianArticles("global", 1)]);
  return guardian[0] || MOCK_FEATURED;
}

async function fetchTicker() {
  const backend = await _backendFetch("/articles/ticker", null);
  if (backend?.items?.length) return backend.items.map(t => `${t} · `);

  // Pull latest 6 headlines from Guardian for the ticker
  try {
    const articles = await _guardianArticles("all", 6);
    return articles.length
      ? articles.map(a => `${a.title} · `)
      : ["MARS-1 crewed launch in T-9 days · ", "Senate AI bill 47-42 · ", "Bitcoin $158,402 · "];
  } catch {
    return ["MARS-1 crewed launch in T-9 days · ", "Senate AI bill 47-42 · "];
  }
}

async function fetchOpinions(tag = "all") {
  const backend = await _backendFetch(`/opinions?tag=${tag}&limit=20`, null);
  if (backend && Array.isArray(backend) && backend.length) return backend;
  return MOCK_OPINIONS;
}

async function fetchTrending() {
  const backend = await _backendFetch("/trending?limit=5", null);
  if (backend && Array.isArray(backend) && backend.length) return backend;
  // Fallback: return top Guardian articles
  const articles = await _guardianArticles("all", 5);
  return articles.length ? articles : MOCK_STORIES.slice(0, 5);
}

async function searchContent(q) {
  if (!q || q.length < 2) return { query: q, articles: [], opinions: [], total: 0 };

  // Try backend search
  const backend = await _backendFetch(`/search?q=${encodeURIComponent(q)}`, null);
  if (backend) return backend;

  // Browser-side: search Guardian directly
  try {
    const r = await fetch(
      `https://content.guardianapis.com/search?api-key=${GUARDIAN_KEY}&q=${encodeURIComponent(q)}&page-size=10&show-fields=trailText,byline,thumbnail`
    );
    if (r.ok) {
      const items = ((await r.json()).response?.results || []).map((a, i) => ({
        id: `gsearch-${i}`,
        source: "guardian",
        title: a.webTitle || "",
        dek: (a.fields?.trailText || "").replace(/<[^>]+>/g, ""),
        author: a.fields?.byline || "",
        category: TOPIC_CATEGORY[a.sectionId] || "Global",
        region: "Global",
        url: a.webUrl || "#",
        image_url: a.fields?.thumbnail || null,
        published_at: a.webPublicationDate || new Date().toISOString(),
        read_time: 5,
        views: 0,
      }));
      // Also search mock opinions
      const qLower = q.toLowerCase();
      const opMatches = MOCK_OPINIONS.filter(o =>
        o.title.toLowerCase().includes(qLower) ||
        o.excerpt.toLowerCase().includes(qLower) ||
        o.tag.toLowerCase().includes(qLower)
      );
      return { query: q, articles: items, opinions: opMatches, total: items.length + opMatches.length };
    }
  } catch {}

  return { query: q, articles: [], opinions: [], total: 0 };
}

// ── Backend-only features (newsletter, drafts, auth) ─────────────────────────

async function subscribeNewsletter(email) {
  if (!API_BASE) return false;
  try {
    const r = await fetch(`${API_BASE}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return r.ok;
  } catch { return false; }
}

async function saveDraft(draft, draftId = null) {
  if (!API_BASE) return { id: `local-${Date.now()}` }; // fake ID if no backend
  try {
    const url = draftId ? `${API_BASE}/drafts/${draftId}` : `${API_BASE}/drafts`;
    const r = await fetch(url, {
      method: draftId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

async function submitDraft(draftId) {
  if (!API_BASE) return true; // pretend success if no backend
  try {
    const r = await fetch(`${API_BASE}/drafts/${draftId}/submit`, { method: "POST" });
    return r.ok;
  } catch { return false; }
}

async function loginUser(email, password) {
  if (!API_BASE) throw new Error("Backend not connected");
  const r = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.detail || "Login failed"); }
  return r.json();
}

async function registerUser(email, password, username) {
  if (!API_BASE) throw new Error("Backend not connected");
  const r = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username: username || undefined }),
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.detail || "Registration failed"); }
  return r.json();
}

Object.assign(window, {
  TOPICS, API_BASE,
  MOCK_STORIES, MOCK_OPINIONS, MOCK_FEATURED,
  fetchArticles, fetchFeatured, fetchTicker, fetchOpinions,
  fetchTrending, searchContent, subscribeNewsletter, saveDraft, submitDraft,
  loginUser, registerUser,
  cardColor, relativeTime, stripHtml,
});
