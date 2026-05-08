// Data layer — fetches from live API, falls back to mock data if API is unreachable
const API_BASE = "http://localhost:8000/api";

// ── Static / reference data ──────────────────────────────────────────────────

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
];

// ── Mock fallbacks (used when API is unreachable) ─────────────────────────────

const MOCK_FEATURED = {
  id: "mock-featured",
  kicker: "// LEAD STORY",
  region: "Global",
  category: "Policy",
  title: "The first generation that voted on housing — and won",
  dek: "In four cities across three continents, voters under 30 just rewrote zoning law. We tracked the organizers, the group chats, and the grandparents who showed up.",
  author: "Maya Okafor",
  read_time: 12,
  views: 284000,
  url: "#",
  image_url: null,
  published_at: new Date().toISOString(),
  source: "axis",
};

const MOCK_STORIES = [
  { id: "1", region: "Global", category: "Climate", title: "Inside the youth-led carbon court suing six governments at once", dek: "A coordinated case filed by 19 plaintiffs — average age 22 — could redefine state liability.", author: "Theo Vance", read_time: 8, views: 0, url: "#", published_at: new Date().toISOString(), source: "axis" },
  { id: "2", region: "US", category: "Policy", title: "Why Gen Z congressional staffers are quietly rewriting the rules", dek: "24-year-old policy aides are shaping bills nobody is reading.", author: "Iris Han", read_time: 6, views: 0, url: "#", published_at: new Date().toISOString(), source: "axis" },
  { id: "3", region: "Canada", category: "Money", title: "Toronto's 'rent council' experiment is in its 18th month. Tenants are winning.", dek: "Co-tenant negotiation panels delivered 14% average reductions.", author: "Lena Park", read_time: 9, views: 0, url: "#", published_at: new Date().toISOString(), source: "axis" },
  { id: "4", region: "Global", category: "Tech", title: "The AI literacy curriculum that 312 high schools just adopted — overnight", dek: "Built by a 19-year-old in three weeks. We sat in on a class.", author: "Wren Adachi", read_time: 5, views: 0, url: "#", published_at: new Date().toISOString(), source: "axis" },
  { id: "5", region: "US", category: "Culture", title: "Group chats are the new newsroom. We mapped 40 of them.", dek: "A look inside the closed Discord servers and Signal threads where real-time city journalism is happening.", author: "Jordan Reyes", read_time: 11, views: 0, url: "#", published_at: new Date().toISOString(), source: "axis" },
  { id: "6", region: "Global", category: "Policy", title: "Voter turnout under 25 hit 71% in last week's local races. What changed?", dek: "Three boring policy fixes — and one TikTok account — rewrote the playbook.", author: "Sasha Bell", read_time: 7, views: 0, url: "#", published_at: new Date().toISOString(), source: "axis" },
];

const MOCK_OPINIONS = [
  { id: "o1", author_name: "Devi Subramanian", author_handle: "@devi", author_role: "Law student, Toronto", title: "We don't need new news. We need new permission.", excerpt: "The story Gen Z keeps not getting told is that we already know what's broken.", tag: "Media", read_time: 4, likes: 8421, created_at: new Date().toISOString() },
  { id: "o2", author_name: "Marcus Kline", author_handle: "@mk", author_role: "Climate organizer", title: "The carbon budget is a group project and we have one week left", excerpt: "The math doesn't math anymore. We need policy that admits that.", tag: "Climate", read_time: 6, likes: 12903, created_at: new Date().toISOString() },
  { id: "o3", author_name: "Yuna Park", author_handle: "@yuna", author_role: "Software engineer", title: "I built the AI tutor my 14-year-old sister actually uses. It's not what you think.", excerpt: 'It doesn\'t write her essays. It refuses to. The most popular feature is a button that says "explain like you\'re tired of me."', tag: "Tech", read_time: 5, likes: 6230, created_at: new Date().toISOString() },
  { id: "o4", author_name: "Andre Simons", author_handle: "@andre", author_role: "Public housing policy intern", title: "Housing is not complicated. We just refuse to build any.", excerpt: "I have read every zoning code in three provinces. The barrier isn't ideology, it's vibes.", tag: "Policy", read_time: 8, likes: 4118, created_at: new Date().toISOString() },
];

// ── API helpers ───────────────────────────────────────────────────────────────

async function apiFetch(path, fallback) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch {
    return fallback;
  }
}

// ── Live API functions (called by React components) ───────────────────────────

async function fetchArticles(topic = "all", limit = 20, offset = 0) {
  return apiFetch(`/articles?topic=${topic}&limit=${limit}&offset=${offset}`, MOCK_STORIES);
}

async function fetchFeatured() {
  return apiFetch("/articles/featured", MOCK_FEATURED);
}

async function fetchTicker() {
  const data = await apiFetch("/articles/ticker", { items: [] });
  const items = data.items || [];
  return items.length > 0 ? items.map(t => `${t} · `) : ["MARS-1 crewed launch in T-9 days · ", "Senate AI bill 47-42 · ", "Bitcoin $158,402 · "];
}

async function fetchOpinions(tag = "all") {
  return apiFetch(`/opinions?tag=${tag}&limit=20`, MOCK_OPINIONS);
}

async function fetchTrending() {
  return apiFetch("/trending?limit=5", MOCK_STORIES.slice(0, 5));
}

async function searchContent(q) {
  if (!q || q.length < 2) return { query: q, articles: [], opinions: [], total: 0 };
  return apiFetch(`/search?q=${encodeURIComponent(q)}`, { query: q, articles: [], opinions: [], total: 0 });
}

async function subscribeNewsletter(email) {
  try {
    const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function saveDraft(draft, draftId = null) {
  try {
    const url = draftId ? `${API_BASE}/drafts/${draftId}` : `${API_BASE}/drafts`;
    const method = draftId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function submitDraft(draftId) {
  try {
    const res = await fetch(`${API_BASE}/drafts/${draftId}/submit`, { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

// Color palette for story cards (cycles through hue values)
const CARD_COLORS = ["260", "200", "150", "320", "30", "240", "180", "280"];
function cardColor(index) { return CARD_COLORS[index % CARD_COLORS.length]; }

// Format relative time from ISO string
function relativeTime(isoString) {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "";
  }
}

Object.assign(window, {
  TOPICS, API_BASE,
  MOCK_STORIES, MOCK_OPINIONS, MOCK_FEATURED,
  fetchArticles, fetchFeatured, fetchTicker, fetchOpinions,
  fetchTrending, searchContent, subscribeNewsletter, saveDraft, submitDraft,
  cardColor, relativeTime,
});
