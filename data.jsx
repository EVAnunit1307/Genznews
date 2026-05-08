// Mock data for the Gen Z news/opinion platform
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

const HOT_TOPICS = [
  "AI Regulation Bill 2026",
  "Housing Index hits 42yr low",
  "Climate refugee corridors",
  "Mental health on the ballot",
  "Student debt forgiveness round 4",
  "Crypto reserve vote tonight",
  "TikTok bill passes Senate",
  "Mars crewed launch — 9 days",
];

const FEATURED = {
  kicker: "// LEAD STORY",
  region: "Global",
  category: "Policy",
  title: "The first generation that voted on housing — and won",
  dek: "In four cities across three continents, voters under 30 just rewrote zoning law. We tracked the organizers, the group chats, and the grandparents who showed up.",
  author: "Maya Okafor",
  authorRole: "Senior correspondent",
  read: "12 min read",
  date: "May 6, 2026",
  views: "284K",
  comments: 1842,
  img: "linear-gradient(135deg, oklch(0.32 0.08 260) 0%, oklch(0.18 0.04 280) 60%, oklch(0.12 0.02 290) 100%)",
};

const STORIES = [
  {
    id: 1, region: "Global", category: "Climate",
    title: "Inside the youth-led carbon court suing six governments at once",
    dek: "A coordinated case filed by 19 plaintiffs — average age 22 — could redefine state liability.",
    author: "Theo Vance", read: "8 min", time: "2h ago", color: "260",
  },
  {
    id: 2, region: "US", category: "Policy",
    title: "Why Gen Z congressional staffers are quietly rewriting the rules",
    dek: "A new generation of 24-year-old policy aides is shaping bills nobody is reading. Here's what they've already changed.",
    author: "Iris Han", read: "6 min", time: "5h ago", color: "200",
  },
  {
    id: 3, region: "Canada", category: "Money",
    title: "Toronto's 'rent council' experiment is in its 18th month. Tenants are winning.",
    dek: "Co-tenant negotiation panels delivered 14% average reductions — and landlords are quietly on board.",
    author: "Lena Park", read: "9 min", time: "Yesterday", color: "150",
  },
  {
    id: 4, region: "Tech", category: "Tech",
    title: "The AI literacy curriculum that 312 high schools just adopted — overnight",
    dek: "Built by a 19-year-old in three weeks. We sat in on a class.",
    author: "Wren Adachi", read: "5 min", time: "8h ago", color: "320",
  },
  {
    id: 5, region: "US", category: "Culture",
    title: "Group chats are the new newsroom. We mapped 40 of them.",
    dek: "A look inside the closed Discord servers and Signal threads where real-time city journalism is happening.",
    author: "Jordan Reyes", read: "11 min", time: "1d ago", color: "30",
  },
  {
    id: 6, region: "Global", category: "Policy",
    title: "Voter turnout under 25 hit 71% in last week's local races. What changed?",
    dek: "Three boring policy fixes — and one TikTok account — rewrote the playbook.",
    author: "Sasha Bell", read: "7 min", time: "1d ago", color: "240",
  },
];

const OPINIONS = [
  {
    id: "o1",
    author: "Devi Subramanian",
    handle: "@devi",
    role: "Law student, Toronto",
    title: "We don't need new news. We need new permission.",
    excerpt: "The story Gen Z keeps not getting told is that we already know what's broken. The question is whether legacy outlets will let us be experts on our own lives — or keep using us as B-roll.",
    tag: "Media",
    read: "4 min",
    likes: 8421,
  },
  {
    id: "o2",
    author: "Marcus Kline",
    handle: "@mk",
    role: "Climate organizer",
    title: "The carbon budget is a group project and we have one week left",
    excerpt: "I have spent four years trying to make this readable. So here it is, plainly: the math doesn't math anymore. We need policy that admits that.",
    tag: "Climate",
    read: "6 min",
    likes: 12903,
  },
  {
    id: "o3",
    author: "Yuna Park",
    handle: "@yuna",
    role: "Software engineer",
    title: "I built the AI tutor my 14-year-old sister actually uses. It's not what you think.",
    excerpt: "It doesn't write her essays. It refuses to. The most popular feature is a button that says \"explain like you're tired of me.\"",
    tag: "Tech",
    read: "5 min",
    likes: 6230,
  },
  {
    id: "o4",
    author: "Andre Simons",
    handle: "@andre",
    role: "Public housing policy intern",
    title: "Housing is not complicated. We just refuse to build any.",
    excerpt: "I have read every zoning code in three provinces. The barrier isn't ideology, it's vibes. Here's how to fix the vibes.",
    tag: "Policy",
    read: "8 min",
    likes: 4118,
  },
];

const TICKER = [
  "MARS-1 crewed launch in T-9 days · ",
  "Senate AI bill 47-42 · ",
  "Toronto rent index -14% YoY · ",
  "Bitcoin $158,402 · ",
  "Climate court ruling expected Friday · ",
  "TikTok appeal denied · ",
  "Student debt round 4 disbursing May 18 · ",
];

Object.assign(window, { TOPICS, HOT_TOPICS, FEATURED, STORIES, OPINIONS, TICKER });
