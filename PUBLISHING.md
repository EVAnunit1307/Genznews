# Publishing — how to run genzthinks

You never touch code to publish. Everything happens in your browser.

## ✍️ Publish an article (the everyday flow)

1. Go to **`https://your-domain.com/admin`** (works on your phone or MacBook).
2. Click **Log in with GitHub** the first time.
3. Hit **New Article**.
4. Write it:
   - **Title** and **Subtitle** (the subtitle shows under the headline and in link previews).
   - Pick a **Category**.
   - Drop in a **Hero image** (optional but nice).
   - Toggle **Featured** if you want it to be the big lead story on the home page (only one at a time).
   - Write the body. Add headings, quotes, lists, images.
5. Click **Publish**.
6. Wait ~1 minute. Vercel rebuilds and your article is live at `your-domain.com/article/its-title`.

**Drafts:** flip the **Draft** toggle on and it stays hidden from the site until you turn it off.
**Edits:** open any article in `/admin`, change it, Publish again.

That's it. No terminal, no code.

---

## 🛠 One-time setup (do these once, then never again)

These wire up the login, the live data, comments, and likes. Do them once after the first deploy.

### 1. Deploy to Vercel
- Import the GitHub repo `EVANunit1307/Genznews` into Vercel.
- **Root Directory:** set it to `Genznews` (where `package.json` lives).
- Framework preset: **Astro** (auto-detected). Deploy.
- Note your production URL (e.g. `https://genznews.vercel.app`). Put it in:
  - `src/config.ts` → `SITE.url`
  - `astro.config.mjs` → `SITE`
  - `public/admin/config.yml` → `base_url`, `site_url`, `display_url`

### 2. Logging in to the CMS

You have **three** ways to log in at `/admin` — pick whichever is easiest:

**Option A — Access Token (simplest, no OAuth app):**
- GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate**.
- Give it access to the `Genznews` repo with **Contents: Read and write** permission.
- At `/admin`, click **Sign In Using Access Token** and paste it. Done.

**Option B — Work with Local Repository (edit on your MacBook, no login):**
- Clone the repo locally, run `npm run dev`, open `/admin`, click **Work with Local Repository**,
  and select the repo folder. Changes commit to your local git — push when ready.

**Option C — Sign in with GitHub (one-click after setup, best for phone):**
- GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
  - Homepage URL: your production URL.
  - Authorization callback URL: `https://your-domain.com/api/callback`
- Copy the **Client ID** and generate a **Client secret**.
- In Vercel → Project → **Settings → Environment Variables**, add:
  - `GITHUB_OAUTH_ID` = the client id
  - `GITHUB_OAUTH_SECRET` = the client secret
- Redeploy. Now the **Sign In with GitHub** button works (uses the `/api/auth` + `/api/callback`
  functions already in this repo).

> If a hero image ever fails a deploy with "image does not exist," it just means the image path
> in that article is off — open the article in `/admin`, re-pick or remove the image, and republish.

### 3. Real stock ticker (Finnhub)
- Get a free key at **finnhub.io/dashboard**.
- Vercel env var: `FINNHUB_KEY` = your key. (Bitcoin needs no key — it uses CoinGecko.)

### 4. Newsletter (Buttondown)
- Get your API key at **buttondown.email/settings/api**.
- Vercel env var: `BUTTONDOWN_KEY` = your key.

### 5. Likes (Upstash Redis)
- In Vercel → **Storage** → add **Upstash for Redis** (free tier) and connect it to the project.
- It sets `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically. (If you use Upstash directly,
  `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` also work.)

### 6. Comments (Giscus)
- Make the repo **public**, then GitHub → repo **Settings → General → Features → enable Discussions**.
- Install the **giscus** app: **github.com/apps/giscus** (grant it this repo).
- Go to **giscus.app**, enter `EVANunit1307/Genznews`, pick a Discussions category (e.g. *Announcements*),
  and copy the **Repository ID** and **Category ID** it shows.
- Paste them into `src/config.ts` → `SITE.giscus` (`repoId`, `category`, `categoryId`). Commit.

### 7. "From around the web" strip (optional, more reliable)
- The strip uses The Guardian's free `test` key by default. For reliability, get a free key at
  **open-platform.theguardian.com** and add Vercel env var `GUARDIAN_KEY`.
- The strip refreshes on each deploy. (Optional: add a daily Vercel Cron job to auto-rebuild.)

### Environment variables summary (Vercel → Settings → Environment Variables)

| Variable | What it's for |
| --- | --- |
| `GITHUB_OAUTH_ID` / `GITHUB_OAUTH_SECRET` | `/admin` login |
| `FINNHUB_KEY` | Stock ticker |
| `BUTTONDOWN_KEY` | Newsletter |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Likes |
| `GUARDIAN_KEY` | (optional) "From around the web" strip |

Never put any of these in code — they live only in Vercel. See `.env.example`.

### Works automatically — no setup needed

These are built for you on every deploy, with zero configuration:

- **Search** — the whole archive is indexed at build time (Pagefind). Readers open it from the
  search icon, the mobile Search tab, or by pressing `/`.
- **Fonts** — self-hosted (no third-party request), so type loads fast and private.
- **Related articles, reading progress, RSS, sitemap, share previews, PWA install** — all automatic.

