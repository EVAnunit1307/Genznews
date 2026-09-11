# Set up editor sign-in

Once this is set up, the editor opens https://genznews.vercel.app/admin/ and chooses **Sign In with GitHub**. They use their own GitHub account. They never need to generate or paste an access token. If asked to sign in again later, they use the same button.

A browser version of these steps is included at `/admin/setup.html` after deployment.

If using Claude to help maintain the website, give it access to the repository and ask: “Read CLAUDE.md and ADMIN-SETUP.md. Help me finish setup one step at a time, then verify I can sign in and publish. Tell me where to enter any secrets directly; don't ask me to paste them into chat.”

## 1. Give the editor access

The current repository owner does this part:

1. Ask the editor to create a [GitHub account](https://github.com/signup) if they do not have one.
2. Open [Genznews → Settings → Collaborators](https://github.com/EVAnunit1307/Genznews/settings/access), choose **Add people**, and invite their GitHub username. They need write access to publish.
3. Have them accept the invitation while signed into their own account.

The person doing the remaining setup also needs permission to manage this website's project in Vercel. The everyday editor does not need Vercel access. If you are handing over site management too, arrange access to Vercel and ownership of the OAuth app with the new site manager; do not share your personal login.

## 2. Create the sign-in app

The person who will manage sign-in should log into their GitHub account and open [Register a new OAuth application](https://github.com/settings/applications/new). This is an **OAuth App**, not a GitHub App or personal access token.

Enter these values exactly for the current site:

| Field | Value |
| --- | --- |
| Application name | `genzthinks Editor` |
| Homepage URL | `https://genznews.vercel.app` |
| Application description | `Sign in to publish on genzthinks` |
| Authorization callback URL | `https://genznews.vercel.app/api/callback` |

Leave device flow off. Click **Register application**. Copy the **Client ID**, then click **Generate a new client secret**. Keep the page open for the next step. The secret goes only into Vercel, not into the repository, editor, or a message.

## 3. Connect it to the website

1. Open the [Vercel dashboard](https://vercel.com/dashboard) and select the project serving `genznews.vercel.app`.
2. Open **Settings → Environment Variables**.
3. Add these two values for the **Production** environment:

   | Name | Value |
   | --- | --- |
   | `GITHUB_OAUTH_ID` | The Client ID from GitHub |
   | `GITHUB_OAUTH_SECRET` | The client secret from GitHub |

4. Save both values.
   Do this before the first deployment of the new login code: token sign-in is disabled in that version, so GitHub sign-in must be configured for editors to get in.
5. Make sure the login changes in this repository have been pushed and deployed. Then open **Deployments**, select the latest production deployment's menu, and choose **Redeploy** so it picks up the saved settings. Wait for it to show **Ready**.

There is no need to add another hosting service or buy a login service.

## 4. Try it as the editor

1. Open https://genznews.vercel.app/admin/ in a private browser window to test a fresh login.
2. Choose **Sign In with GitHub** and sign into the editor's account.
3. Approve the `genzthinks Editor` app when GitHub asks. It requests repository access so it can save articles to GitHub.
4. Confirm the article list opens. Close and reopen the editor in a normal browser window to check the everyday experience.
5. Publish a small test article with **Draft** switched on. Confirm the save succeeds and Vercel produces a successful deployment. Delete the test article afterward.

Drafts are hidden from the website but their files are still saved in the public repository. Do not put private content in a test draft.

## If something goes wrong

| What you see | What to do |
| --- | --- |
| “Sign-in needs a one-time setup” | Check both environment variable names and values in Vercel, select Production, and redeploy. |
| GitHub says the callback URL is wrong | In the OAuth app, use `https://genznews.vercel.app/api/callback` exactly. |
| Sign-in expires or cookies are blocked | Close the popup, allow cookies for the site, and start again from the editor. |
| Nothing opens when you click sign in | Allow popups for the site, then click again. |
| You sign in but cannot open or publish articles | Confirm you accepted the repository invitation and are using that GitHub account. If saving works but the site does not update, ask the site manager to check the latest Vercel deployment. |
| GitHub sign-in repeatedly fails | The site manager should check the Client ID and secret belong to the same OAuth App and redeploy after correcting them. |
| You are asked to sign in again later | Use **Sign In with GitHub** again. No replacement personal token is needed. |

Use the production editor address above, rather than a Vercel preview URL. The login response is deliberately restricted to the configured production website.

## If the website address changes

Have the site maintainer update all of these together:

- GitHub OAuth App: homepage and authorization callback URL (`https://NEW-DOMAIN/api/callback`).
- Vercel Production environment: `ADMIN_SITE_URL=https://NEW-DOMAIN` (no path).
- `public/admin/config.yml`: `backend.base_url`, `site_url`, and `display_url`.
- `src/config.ts` and `astro.config.mjs`: the public site URL.
- The addresses in this guide and `public/admin/setup.html`.

Then deploy and test sign-in at the new address. The site defaults to `https://genznews.vercel.app` if `ADMIN_SITE_URL` is not set. Local `astro dev` does not run the Vercel login functions; use the production editor for this handoff.

## Maintainer checks

Run `npm ci`, `npm run test:auth` (Node 22.6+), and `npm run build`. Authentication tests exercise redirects, state validation, failed exchanges, safe popup messaging, and serialization with mocked GitHub responses. A real sign-in and publish test still requires the production app credentials and the editor's account.

Reference: [Sveltia GitHub login](https://sveltiacms.app/en/docs/backends/github), [GitHub OAuth app setup](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app), [Vercel environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables). OAuth access can be revoked; this flow avoids managing personal tokens rather than promising a permanent session.
