import { getCached, setCached } from "./cache";
import { fetchContributedNotOwnedCount, fetchContributions } from "./github/graphql";
import { calculateAchievements } from "./stats/achievements";
import { calculateDayOfWeekSplit } from "./stats/dayOfWeek";
import { getLanguageStats } from "./stats/getLanguageStats";
import { Period, periodToRange } from "./stats/period";
import { getPreviousRecapRange, getRecapRange, RecapType } from "./stats/recap";
import { calculateRecords } from "./stats/records";
import { calculateStreaks } from "./stats/streaks";
import { Env } from "./types";

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const response = await handleRequest(request, env);
        const headers = new Headers(response.headers);
        headers.set("Access-Control-Allow-Origin", "*");
        return new Response(response.body, { status: response.status, headers });
    },
};

async function handleRequest(request: Request, env: Env): Promise<Response> {
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
            const records = calculateRecords(
                contributions.contributionCalendar.weeks,
                contributions.commitContributionsByRepository,
            );
            const result = { ...contributions, ...streaks, records };

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
        const periodParam = url.searchParams.get("period") as Period | null;

        if (!username) {
            return new Response(JSON.stringify({ error: "username required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const cacheKey = `languages:${username}:${periodParam ?? "all"}`;
        const cached = await getCached<any>(env, cacheKey);
        if (cached) {
            return new Response(JSON.stringify(cached), {
                headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
            });
        }

        try {
            const { from } = periodParam ? periodToRange(periodParam) : { from: undefined };
            const stats = await getLanguageStats(username, env, from);
            const result = { ...stats, estimate: true, period: periodParam ?? "all" };

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

    if (url.pathname === "/api/achievements") {
        const username = url.searchParams.get("username");

        if (!username) {
            return new Response(JSON.stringify({ error: "username required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const cacheKey = `achievements:${username}`;
        const cached = await getCached<any>(env, cacheKey);
        if (cached) {
            return new Response(JSON.stringify(cached), {
                headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
            });
        }

        try {
            const { from, to } = periodToRange("1yr");

            const [contributions, contributedNotOwnedCount, languageStats] = await Promise.all([
                fetchContributions(username, from, to, env),
                fetchContributedNotOwnedCount(username, env),
                getLanguageStats(username, env),
            ]);

            const streaks = calculateStreaks(contributions.contributionCalendar.weeks);
            const records = calculateRecords(
                contributions.contributionCalendar.weeks,
                contributions.commitContributionsByRepository,
            );

            const { weekend, weekday } = calculateDayOfWeekSplit(contributions.contributionCalendar.weeks);

            const achievements = calculateAchievements({
                languageCount: languageStats.languages.length,
                longestStreak: streaks.longestStreak,
                repoCount: contributions.totalRepositoriesWithContributedCommits,
                contributedNotOwnedCount,
                totalReviews: contributions.totalPullRequestReviewContributions,
                totalCommits: contributions.totalCommitContributions,
                totalPRs: contributions.totalPullRequestContributions,
                totalIssues: contributions.totalIssueContributions,
                mostCommitsInADay: records.mostCommitsInADay?.count ?? 0,
                mostCommitsInAWeek: records.mostCommitsInAWeek?.count ?? 0,
                activeDays: records.activeDays,
                reposCreated: contributions.totalRepositoryContributions,
                weekendContributions: weekend,
                weekdayContributions: weekday,
                totalContributions: contributions.contributionCalendar.totalContributions,
                mostActiveRepoCommits: records.mostActiveRepo?.count ?? 0,
            });

            const result = { achievements, basedOnPeriod: "1yr" as const };

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
    
    if (url.pathname === "/api/recap") {
        const username = url.searchParams.get("username");
        const type = (url.searchParams.get("type") ?? "week") as RecapType;
        const yearParam = url.searchParams.get("year");

        if (!username) {
            return new Response(JSON.stringify({ error: "username required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (!["week", "month", "year"].includes(type)) {
            return new Response(JSON.stringify({ error: "type must be week, month, or year" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const year = yearParam ? parseInt(yearParam, 10) : undefined;
        const cacheKey = `recap:${type}:${username}${year ? `:${year}` : ""}`;

        const cached = await getCached<any>(env, cacheKey);
        if (cached) {
            return new Response(JSON.stringify(cached), {
                headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
            });
        }

        try {
            const { from, to } = getRecapRange(type, year);
            const { from: prevFrom, to: prevTo } = getPreviousRecapRange(type, year);

            const [contributions, previousContributions, languageStats] = await Promise.all([
                fetchContributions(username, from, to, env),
                fetchContributions(username, prevFrom, prevTo, env),
                getLanguageStats(username, env, from),
            ]);
            const streaks = calculateStreaks(contributions.contributionCalendar.weeks);
            const records = calculateRecords(
                contributions.contributionCalendar.weeks,
                contributions.commitContributionsByRepository
            );

            const previous = {
                totalCommitContributions: previousContributions.totalCommitContributions,
                totalPullRequestContributions: previousContributions.totalPullRequestContributions,
                totalIssueContributions: previousContributions.totalIssueContributions,
                totalPullRequestReviewContributions: previousContributions.totalPullRequestReviewContributions,
                totalRepositoriesWithContributedCommits: previousContributions.totalRepositoriesWithContributedCommits,
                totalRepositoryContributions: previousContributions.totalRepositoryContributions,
            }

            const result = {
                ...contributions, 
                ...streaks, 
                records, 
                languages: languageStats.languages,
                previous,
                recapType: type, 
                from, 
                to 
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
}
