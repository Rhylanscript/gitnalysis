# Gitnalysis

A simple personal GitHub activity dashboard that shows deeper information than the default contribution graph. Language habits, streaks, personal records & achievements, and Spotify wrapped style week/month/year recaps, all hosted on Cloudflare.

Live: [gitnalysis][gitnalysis]

---

## Features

- **Overview stats** - commits, PRs, issues, reviews, repos contributed to, current/longest streak, filterable by period (7d / 30d / 3mo / 6mo / 1yr)
- **Activity timeline** - interactive daily contribution graph showing your activity on GitHub
- **Language breakdown** - top languages and per repo splits, clearly labeled as an estimate (see [Known limitations][known-limits]
- **Personal records** - best day, best week, most active month, most active repo
- **Recaps** - week / month / year "wrapped" views with a previous period comparison
- **Achievements** - badges for streaks, language diversity, open-source contribution, and more

All data is public GitHub activity, so no login required.

---

## Getting started

### Prerequisites

- Node.js 18+
- A Cloudflare account (free tier is enough)
- A GitHub [Personal Access Token][PAT] scoped to **public repositories, readonly**

### 1. Clone the repo

```bash
git clone https://github.com/Rhylanscript/gitnalysis.git
cd gitnalysis
```

### 2. Worker setup

```bash
cd worker
npm install
npx wrangler login
```

Set your Github token as a worker secret:

```bash
npx wrangler secret put GITHUB_TOKEN
```

Create a KV namespace (or reuse the one referenced in `wrangler.toml` if you're forking this repo and want your own):

```bash
npx wrangler kv namespace create STATS_CACHE
```

Update the `id` in `wrangler.toml` to match, then run the Worker locally:

```bash
npx wrangler dev
```

> **Windows/PowerShell users:** if you change any cached routes response shape during development, clear the local kv before restarting `wrangler dev`, or you might get stale data:
>
> ```powershell
> Remove-Item -Recurse -Force .wrangler\state\v3\kv
> ```

### 3. Frontend setup

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

## Environment variables

| Variable       | Where                                                           | Purpose                                    |
| -------------- | --------------------------------------------------------------- | ------------------------------------------ |
| `GITHUB_TOKEN` | Worker secret (`wrangler secret put`)                           | Authenticates GitHub REST/GraphQL requests |
| `VITE_API_URL` | Frontend `.env` (local) / Cloudflare Pages env var (production) | Base URL the frontend calls for the API    |

---

## API

All routes are served by the Worker and proxy/aggregate GitHub data. Every response includes an `X-Cache: HIT|MISS` header.

| Route                                                   | Description                                                           |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `GET /api/user?username=`                               | GitHub profile                                                        |
| `GET /api/stats?username=&period=`                      | Contributions, streaks, and records for a period                      |
| `GET /api/languages?username=&period=`                  | Language breakdown (optionally period-filtered)                       |
| `GET /api/achievements?username=`                       | Achievement badges, computed off a fixed 1-year lookback              |
| `GET /api/recap?username=&type=week\|month\|year&year=` | Full recap: stats, records, languages, and previous-period comparison |

---

## Deployment

Both halves deploy automatically on push to `main` - through two separate pipelines:

- **Frontend** - Cloudflare Pages Git integration builds `frontend/` (root directory `frontend`, build command `npm run build`, output directory `dist`) whenever anything changes.
- **Worker** - a GitHub Actions workflow (`.github/workflows/deploy-worker.yml`) runs `wrangler deploy` whenever anything under `worker/` changes. This requires a `CLOUDFLARE_API_TOKEN` repo secret (Cloudflare dashboard -> My Profile -> API Tokens -> "Edit Cloudflare Workers" template).

---

## Known limitations

- **Public data only.** The GitHub token is scoped to public repos, read-only. Every page that shows contribution counts also shows how many private contributions aren't reflected. Private-repo data via OAuth is a future idea
- **Language stats are an estimate**, computed from current repo language bytesplits (GitHub's `/languages` endpoint), not per commit diffing, capped at the 30 most recently active repos to stay within Cloudflare 50 subrequest per invocation limit.
- **"All time" data loops year by year**, since GitHub's GraphQL contribution data is limited to ~1 year per query.
- **Commit timestamps** reflect the committers local machine clock (or UTC if unset), any time of day feature would need to be labeled as approximate, which is part of why coding habits/time of day stats arent implemented yet (see below)

## Future Additions

Deferred to a later pass, mostly because they need per commit data rather than aggregate contribution data and I dont want to implement them right now:

- Coding habits (activity by hour, day*hour heatmap)
- Precise language usage over time / fastest growing language
- GitHub OAuth + private repo data
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

[gitnalysis]: https://gitnalysis.pages.dev
[PAT]: https://github.com/settings/tokens
