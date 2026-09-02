import { getCached, setCached } from "./cache";
import { fetchContributions } from "./github/graphql";
import { fetchRepoLanguages, fetchUserRepos } from "./github/rest";
import { aggregateLanguages } from "./stats/languages";
import { Period, periodToRange } from "./stats/period";
import { calculateStreaks } from "./stats/streaks";
import { Env } from "./types";

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === "/api/user") {
            const username = url.searchParams.get("username");
            if (!username) {
                return new Response(JSON.stringify({ error: "username required" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            const ghResponse = await fetch(`https://api.github.com/users/${username}`, {
                headers: {
                    "User-Agent": "gitnalysis",
                    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
                    Accept: "application/vnd.github+json",
                },
            });

            if (!ghResponse.ok) {
                return new Response(JSON.stringify({ error: "user not found" }), {
                    status: ghResponse.status,
                    headers: { "Content-Type": "application/json" },
                });
            }

            const data = await ghResponse.json();
            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" },
            });
        }

        if (url.pathname === "/api/stats") {
            const username = url.searchParams.get("username");
            const period = (url.searchParams.get("period") ?? "30d") as Period;

            if (!username) {
                return new Response(JSON.stringify({ error: "username required" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            const cacheKey = `${username}:${period}`;
            const cached = await getCached<any>(env, cacheKey);
            if (cached) {
                return new Response(JSON.stringify(cached), {
                    headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
                });
            }

            const { from, to } = periodToRange(period);

            try {
                const contributions = await fetchContributions(username, from, to, env);
                const streaks = calculateStreaks(contributions.contributionCalendar.weeks);
                const result = { ...contributions, ...streaks };

                await setCached(env, cacheKey, result);

                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json", "X-Cache": "MISS" },
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: String(err) }), {
                    status: 502,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        if (url.pathname === "/api/languages") {
            const username = url.searchParams.get("username");

            if (!username) {
                return new Response(JSON.stringify({ error: "username required" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            const cacheKey = `languages:${username}`;
            const cached = await getCached<any>(env, cacheKey);
            if (cached) {
                return new Response(JSON.stringify(cached), {
                    headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
                });
            }

            try {
                const MAX_REPOS_FOR_LANGUAGES = 30;

                const repos = await fetchUserRepos(username, env);
                const limitedRepos = repos.filter((r) => !r.fork).slice(0, MAX_REPOS_FOR_LANGUAGES);

                const repoLanguages = await Promise.all(
                    limitedRepos.map(async (repo) => ({
                        repo: repo.name,
                        languages: await fetchRepoLanguages(repo.full_name, env),
                    }))
                );

                const stats = aggregateLanguages(repoLanguages);
                const result = {
                    ...stats,
                    estimate: true,
                    reposAnalysed: limitedRepos.length,
                    totalRepos: repos.length,
                };

                await setCached(env, cacheKey, result);

                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json", "X-Cache": "MISS" },
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: String(err) }), {
                    status: 502,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        return new Response("Not found", { status: 404 });
    },
};
