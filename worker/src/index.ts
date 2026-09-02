import { fetchContributions } from "./github/graphql";
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

            const { from, to } = periodToRange(period);

            try {
                const contributions = await fetchContributions(username, from, to, env);
                const streaks = calculateStreaks(contributions.contributionCalendar.weeks);

                return new Response(JSON.stringify({ ...contributions, ...streaks }), {
                    headers: { "Content-Type": "application/json" },
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
