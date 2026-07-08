# Launch checklist — genzthinks

**Status: the code is done.** What's left is deployment + turning on a few free services +
making the content yours. Everything below is covered by free tiers. Work top to bottom.

Detailed setup instructions live in [PUBLISHING.md](PUBLISHING.md); this is the ordered punch list.

---

## 0. Do first — security
- [ ] **Rotate the old NYTimes API key.** It's still in this repo's git history (the deleted
      `config.js`). Revoke/regenerate it at **developer.nytimes.com → My Apps**. The new site
      never uses it, but the leaked key must be killed.

## 1. Push the code
- [ ] `git push` — sends your local commits to `EVANunit1307/Genznews`.
- [ ] Make the repo **public** on GitHub (required for Giscus comments; fine for a personal magazine).

## 2. Deploy to Vercel
- [ ] vercel.com → **Add New → Project** → import `EVANunit1307/Genznews`.
- [ ] **Root Directory: `Genznews`** ← important (that folder holds `package.json`).
- [ ] Framework preset: **Astro** (auto-detected) → **Deploy**.
- [ ] Note the live URL (e.g. `https://genznews.vercel.app`).

✅ **Working immediately, no config:** the real stock ticker (Yahoo), search, "from around the
web," share previews, RSS, sitemap, and PWA install.

## 3. Point it at your final URL
Only if your URL is **not** exactly `https://genznews.vercel.app`, update it in these places,
then commit + push:
- [ ] `astro.config.mjs` → `const SITE`
- [ ] `src/config.ts` → `SITE.url`
- [ ] `public/robots.txt` → the `Sitemap:` line
- [ ] `public/admin/config.yml` → `base_url`, `site_url`, `display_url`
- [ ] *(optional)* add a **custom domain** in Vercel → Settings → Domains, then use that URL above.

## 4. Turn on the free extras
Add env vars in **Vercel → Settings → Environment Variables**, then redeploy.

**Likes + Newsletter — one service covers both**
- [ ] Vercel → **Storage → Upstash for Redis** → create & connect (auto-adds `KV_REST_API_URL`
      + `KV_REST_API_TOKEN`).
- [ ] Result: likes persist, and newsletter signups are saved to your KV (`subscribers` set).

**Comments — Giscus**
- [ ] Repo **Settings → General → Features → enable Discussions**.
- [ ] Install **github.com/apps/giscus** for this repo.
- [ ] At **giscus.app**, enter `EVANunit1307/Genznews`, pick a Discussions category → copy the
      **Repository ID** + **Category ID**.
- [ ] Paste them into `src/config.ts` → `SITE.giscus` (`repoId`, `category`, `categoryId`). Commit + push.

**CMS login — pick one**
- [ ] **Easiest:** at `/admin`, click **Sign In Using Access Token** and paste a GitHub
      fine-grained token (Contents: read/write on this repo). No app needed.
- [ ] **Or one-click GitHub:** create a GitHub OAuth App (callback `https://YOUR-URL/api/callback`)
      and set `GITHUB_OAUTH_ID` + `GITHUB_OAUTH_SECRET` in Vercel.

## 5. Make it yours (content)
- [ ] `src/config.ts` → set `SITE.author` to your name (used on bylines).
- [ ] `src/components/AboutSection.astro` → rewrite the About copy in your voice.
- [ ] Replace the 3 sample posts: write your own in `/admin`, then delete the samples in
      `src/content/articles/` (the `.md` files + their hero images).
- [ ] *(If rebranding away from "genzthinks")* update the name in `src/config.ts` and the `g` wordmark.

## 6. Optional upgrades
- [ ] `GUARDIAN_KEY` — free at open-platform.theguardian.com; makes the "around the web" strip
      more reliable than the shared `test` key.
- [ ] `BUTTONDOWN_KEY` — upgrades the newsletter to real confirmation + sending emails.
- [ ] `FINNHUB_KEY` — optional secondary fallback for the ticker (not needed; Yahoo is primary).

## 7. Verify, then launch
- [ ] Open the live site on your **iPhone**: hero video, tap targets, bottom tab bar, **Add to Home Screen**.
- [ ] Test **native share** on an article, the **like** button, **search** (press `/`), and **comments**.
- [ ] Publish a test article at `/admin` → confirm it's live in ~1 min → delete it.
- [ ] Run **Lighthouse (mobile)** in Chrome DevTools → aim for ≥95 performance / SEO / accessibility.

---

## Already done — no action needed
Astro + Preact static build (~44 KB JS total), self-hosted fonts, the full liquid-glass design,
15 routes, per-article OpenGraph/Twitter share previews + JSON-LD, sitemap + RSS + robots,
PWA manifest + icons + theme color, security headers (HSTS, X-Frame-Options, …), all serverless
proxies (stocks/newsletter/likes/OAuth), Pagefind search, and the Sveltia CMS at `/admin`.

## Env var quick reference
| Variable | Needed for | Required? |
| --- | --- | --- |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Likes **and** newsletter | Recommended (free) |
| `GITHUB_OAUTH_ID` / `GITHUB_OAUTH_SECRET` | One-click CMS login | Optional (token works instead) |
| `GUARDIAN_KEY` | "Around the web" reliability | Optional |
| `BUTTONDOWN_KEY` | Newsletter email sending | Optional |
| `FINNHUB_KEY` | Ticker fallback | Optional |
