# Gitnalysis

A simple personal GitHub activity dashboard that shows deeper information than the default contribution graph. Language habits, streaks, personal records & achievements, and Spotify wrapped style week/month/year recaps, all hosted on Cloudflare.

Live: [gitnalysis][gitnalysis]

---

## Features

- **Overview stats** - commits, PRs, issues, reviews, repos contributed to, current/longest streak, filterable by period (7d / 30d / 3mo / 6mo / 1yr)
- **Activity timeline** - interactive daily contribution graph showing your activity on GitHub
- **Language breakdown** - top languages and per repo splits, clearly labeled as an estimate (see [Known limitations][known-limits])
- **Personal records** - best day, best week, most active month, most active repo
- **Recaps** - week / month / year "wrapped" views with a previous period comparison
- **Achievements** - badges for streaks, language diversity, open-source contribution, and more
- **Optional sign-in** - viewing anyones stats requires no login and only ever shows public activity; signing in with your own GitHub account additionally counts your own private contributions toward your own stats (see [Authentication][auth] below)

---

## Getting started

### Prerequisites

- Node.js 18+
- A Cloudflare account (free tier is enough)
- A GitHub [Personal Access Token][PAT] scoped to **public repositories, readonly** (used for public lookups)
- A GitHub [OAuth App][oauth-apps] (used for the optional sign-in feature - see below)

### 1. Clone the repo

```bash
git clone https://github.com/Rhylanscript/gitnalysis.git
cd gitnalysis
```

### 2. Create a GitHub OAuth App

Sign in is optional to use, but the worker expects OAuth credentials to exist even if you never click "Sign in." Register one at **GitHub -> Settings -> Developer settings -> OAuth Apps -> New OAuth App**:

- **Application name**: anything, e.g. `Gitnalysis (dev)`
- **Homepage URL**: `http://localhost:5173`
- **Authorization callback URL**: `http://localhost:8787/auth/callback`
- Leave "Enable Device Flow" unchecked

You'll get a **Client ID** (safe to show) and can generate a **Client Secret** (never commit this).

> If youre deploying your own production copy, register a second OAuth App with your production URLs instead, and keep its credentials separate from your local dev ones.

### 3. Worker setup

```bash
cd worker
npm install
npx wrangler login
```

Create `worker/.dev.vars` (gitignored) with:

```env
GITHUB_TOKEN=your_public_readonly_pat
GITHUB_OAUTH_CLIENT_ID=your_dev_oauth_app_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_dev_oauth_app_client_secret
GITHUB_OAUTH_CALLBACK_URL=http://localhost:8787/auth/callback
FRONTEND_URL=http://localhost:5173
```

Create the two KV namespaces (or reuse the ones referenced in `wrangler.toml` if you're forking this repo and want your own):

```bash
npx wrangler kv namespace create STATS_CACHE
npx wrangler kv namespace create SESSIONS
```

Update the `id`s in `wrangler.toml` to match, then run the Worker locally:

```bash
npx wrangler dev
```

> **Windows/PowerShell users:** if you change any cached routes response shape during development, clear the local kv before restarting `wrangler dev`, or you might get stale data:
>
> ```powershell
> Remove-Item -Recurse -Force .wrangler\state\v3\kv
> ```

### 4. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_URL` in `.env` to your local Worker URL (`http://localhost:8787` by default), then:

```bash
npm run dev
```

---

## Authentication

Gitnalysis has two tiers of access, and which one you get depends only on whether you're viewing your *own* profile while signed in:

- **Anonymous / viewing someone else's profile** - always public data only, using a shared readonly PAT. No login is required for this.
- **Signed in and viewing your own profile** - your own private contributions are additionally counted toward your stats, using a GitHub OAuth token scoped to `read:user`. This only unlocks your own aggregate contribution *counts* - it does not grant Gitnalysis read access to your private repository contents (that would need a broader `repo` scope, which this app deliberately doesn't request).

Signing in never affects what anyone else sees when they look up your username, and your own token is never used to view anyone else's private data.

Sessions are stored serverside (Cloudflare KV) behind an `HttpOnly` cookie, your GitHub token is never exposed to frontend JavaScript.

---

## Environment variables

| Variable                      | Where                                                          | Purpose                                                    |
| ----------------------------- | ---------------------------------------------------------------| ---------------------------------------------------------- |
| `GITHUB_TOKEN`                | Worker secret (`wrangler secret put`)                          | Authenticates public GitHub REST/GraphQL requests          |
| `GITHUB_OAUTH_CLIENT_ID`      | Worker var (`wrangler.toml` / `.dev.vars`)                     | GitHub OAuth App Client ID                                 |
| `GITHUB_OAUTH_CLIENT_SECRET`  | Worker secret (`wrangler secret put` / `.dev.vars` locally)    | GitHub OAuth App Client Secret                             |
| `GITHUB_OAUTH_CALLBACK_URL`   | Worker var (`wrangler.toml` / `.dev.vars`)                     | Must exactly match the OAuth App's registered callback URL |
| `FRONTEND_URL`                | Worker var (`wrangler.toml` / `.dev.vars`)                     | Where `/auth/callback` and `/auth/logout` redirect back to |
| `VITE_API_URL`                | Frontend `.env` (local) / Cloudflare Pages env var (production)| Base URL the frontend calls for the API                    |

---

## API

All routes are served by the Worker and proxy/aggregate GitHub data. Every response includes an `X-Cache: HIT|MISS` header.

| Route                                                                   | Description                                                                           |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `GET /api/user?username=`                                               | GitHub profile                                                                        |
| `GET /api/stats?username=&period=&includePrivate=`                      | Contributions, streaks, and records for a period                                      |
| `GET /api/languages?username=&period=&includePrivate=`                  | Language breakdown (optionally period filtered)                                       |
| `GET /api/achievements?username=&includePrivate=`                       | Achievement badges, computed off a fixed 1-year lookback                              |
| `GET /api/recap?username=&type=week\|month\|year&year=&includePrivate=` | Full recap: stats, records, languages, and previous period comparison                 |
| `GET /auth/login`                                                       | Redirects to GitHub's OAuth consent screen                                            |
| `GET /auth/callback`                                                    | GitHub redirects here after consent; sets the session cookie                          |
| `GET /auth/logout`                                                      | Clears the current session                                                            |
| `GET /auth/me`                                                          | Returns `{ signedIn, username? }` for the current session                             |

`includePrivate` defaults to `true` and is only honored when the requested `username` matches the signed-in session - it's silently ignored otherwise, so it's safe to always pass it from the frontend.

---

## Deployment

Both halves deploy automatically on push to `main`, through two separate pipelines:

- **Frontend** - Cloudflare Pages Git integration builds `frontend/` (root directory `frontend`, build command `npm run build`, output directory `dist`) whenever anything changes.
- **Worker** - a GitHub Actions workflow (`.github/workflows/deploy-worker.yml`) runs `wrangler deploy` whenever anything under `worker/` changes. This requires a `CLOUDFLARE_API_TOKEN` repo secret (Cloudflare dashboard -> My Profile -> API Tokens -> "Edit Cloudflare Workers" template).

---

## Known limitations

- **Private data is opt in and limited in scope.** Signing in only unlocks your own aggregate private contribution counts (`read:user` scope) - not private repo names, languages, or content. Every page that shows contribution counts also shows how many private contributions aren't reflected when you're not signed in.
- **Language stats are an estimate**, computed from current repo language bytesplits (GitHub's `/languages` endpoint), not per commit diffing, capped at the 30 most recently active repos to stay within Cloudflare 50 subrequest per invocation limit, and currently public-repos-only regardless of sign-in status.
- **"All time" data loops year by year**, since GitHub's GraphQL contribution data is limited to ~1 year per query.
- **Commit timestamps** reflect the committers local machine clock (or UTC if unset), any time of day feature would need to be labeled as approximate, which is part of why coding habits/time of day stats arent implemented yet (see below)

## Future Additions

Deferred to a later pass, mostly because they need per commit data rather than aggregate contribution data and I dont want to implement them right now:

- Coding habits (activity by hour, day*hour heatmap)
- Precise language usage over time / fastest growing language
- Private repo language/content detail via a broader OAuth scope
- Shareable public stats card
- Period over period comparison on the main dashboard (already exists on recap pages)

---

## Contributing

This is a personal project, but issues and PRs are welcome. A few conventions if youre sending a PR:

- One feature branch per concern - `feat/...`, `fix/...`, `chore/...`, `ci/...`, `docs/...`, `refactor/...`
- Commit messages use the same prefixes (`feat:`, `fix:`, `chore:`, etc.)
- All calendar boundary date math must use `Date.UTC(...)` explicitly, never a local `Date()` constructor for anything that needs to align to midnight/month start/etc.

---

## License

This repository is licensed under the [MIT License.][license]

<!-- LINKS -->
[license]: license

[known-limits]: #known-limitations
[auth]: #authentication
[oauth-apps]: https://github.com/settings/developers

[gitnalysis]: https://gitnalysis.pages.dev
[PAT]: https://github.com/settings/tokens
