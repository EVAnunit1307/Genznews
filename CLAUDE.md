# Working on genzthinks

This website is being handed to a nontechnical owner. Explain changes in plain language and handle the implementation and checks. For routine writing, guide them to the editor rather than requiring terminal commands.

## Start here

- `ADMIN-SETUP.md`: exact GitHub sign-in setup, invitations, troubleshooting, and production smoke test.
- `PUBLISHING.md`: everyday publishing and optional services.
- `LAUNCH.md`: historical launch checklist. Its claims about deployed features are not proof of current production settings; verify before reporting them as working.

Production address: `https://genznews.vercel.app`. Editor: `/admin/`. Browser setup guide: `/admin/setup.html`.

## How the site works

Astro builds a static site. Preact handles interactive components. Vercel runs the `api/` functions. Sveltia CMS saves content to `EVAnunit1307/Genznews` on `main`; the connected Vercel project is expected to deploy those commits.

| Change | Files |
| --- | --- |
| Articles and their uploaded images | `src/content/articles/` |
| Author name, bio, About section | `src/data/about.json` |
| Home page and footer wording | `src/data/site.json` |
| Editor fields and GitHub backend | `public/admin/config.yml` |
| Layout and appearance | `src/pages/`, `src/components/`, `src/styles/global.css` |
| Shared site constants | `src/config.ts` |
| GitHub login | `api/auth.ts`, `api/callback.ts`, `src/lib/admin-oauth.js` |
| Comments, reactions, newsletter, stocks | Corresponding handlers in `api/` |

Keep categories aligned across `src/config.ts`, `src/content/config.ts`, and `public/admin/config.yml`. Keep uploaded image paths valid. Drafts are hidden from the live website, but their files are visible in the public repository.

## Login and account ownership

The editor signs in with their own GitHub account and needs repository write access. The deployed configuration allows OAuth login only. Before deploying this change for the first time, verify that `GITHUB_OAUTH_ID` and `GITHUB_OAUTH_SECRET` are saved in Vercel Production. If they are missing, follow `ADMIN-SETUP.md`; do not tell the owner that login is ready.

Keep credentials in Vercel or ignored local environment files. Guide the owner to enter secrets directly in the service; do not ask them to paste secrets into chat or commit them. Preserve the callback's trusted origin, opener validation, state-cookie checks, and no-store headers.

When changing domains, follow `ADMIN-SETUP.md` and also update the public site URL in `src/config.ts` and `astro.config.mjs`. Do not assume GitHub repository access also gives access to Vercel, domain registration, Redis, or newsletter services. Comment moderation currently uses `COMMENTS_ADMIN_TOKEN` separately from editor login.

## Making and checking changes

1. Read `git status` and the relevant files first. Preserve existing work and published articles.
2. Make focused changes for the owner's request. Use the existing stack and CMS where possible.
3. Install locked dependencies with `npm ci` when needed. Use a compatible Node version; auth tests require Node 22.6+.
4. Run `npm run test:auth` for login changes and `npm run build` for code or content changes. Check `git diff --check`. Review changed UI in a browser.
5. Explain what changed, what passed, and what still needs an account setup or live test. A successful local build does not verify Vercel environment variables or a real GitHub sign-in.

`npm run dev` runs Astro, not the Vercel API functions. In Astro development, the static CMS entry may require `/admin/index.html`. Use the production `/admin/` for the handoff sign-in test. Never edit `dist/` as source.

Before pushing, inspect the diff and current remote branch state. Article publishing can add commits to `main` while you work. Preserve those commits; do not force-push over content. A push to `main` can update the live site. After an authorized deployment, check Vercel's result and the affected live feature.

## Handoff completion

The handoff is complete only after the new editor can sign in with their own account, save a test article, and see a successful deployment. Arrange ownership/access for the services they will manage and tell them who to contact for account recovery. The owner should not need an AI assistant to publish an ordinary article after setup.
