import { buildExpiredSessionCookie, buildSessionCookie, getCookie } from "./auth/cookies";
import { buildAuthorizeUrl, exchangeCodeForToken, fetchAuthenticatedUsername } from "./auth/github";
import { resolveAccess } from "./auth/resolveToken";
import { createOAuthState, createSession, deleteSession, getSession, verifyAndConsumeOAuthState } from "./auth/session";
import { getCached, setCached } from "./cache";
import { FRONTEND_URL, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "./config";
import { corsHeadersFor, handlePreflight } from "./cors";
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
        if (request.method === "OPTIONS") {
            return handlePreflight(request);
        }

        const response = await handleRequest(request, env);

        const headers = new Headers(response.headers);
        const cors = corsHeadersFor(request);
        cors.forEach((value, key) => headers.set(key, value));

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

        const { token, isOwnPrivateData } = await resolveAccess(request, env, username);

        const cacheKey = `${username}:${period}:${isOwnPrivateData ? "private" : "public"}`;
        const cached = await getCached<any>(env, cacheKey);
        if (cached) {
            return new Response(JSON.stringify(cached), {
                headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
            });
        }

        const { from, to } = periodToRange(period);

        try {
            const contributions = await fetchContributions(username, from, to, token);
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

        const { token, isOwnPrivateData } = await resolveAccess(request, env, username);

        const cacheKey = `languages:${username}:${periodParam ?? "all"}:${isOwnPrivateData ? "private" : "public"}`;
        const cached = await getCached<any>(env, cacheKey);
        if (cached) {
            return new Response(JSON.stringify(cached), {
                headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
            });
        }

        try {
            const { from } = periodParam ? periodToRange(periodParam) : { from: undefined };
            const stats = await getLanguageStats(username, token, from);
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

        const { token, isOwnPrivateData } = await resolveAccess(request, env, username);

        const cacheKey = `achievements:${username}:${isOwnPrivateData ? "private" : "public"}`;
        const cached = await getCached<any>(env, cacheKey);
        if (cached) {
            return new Response(JSON.stringify(cached), {
                headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
            });
        }

        try {
            const { from, to } = periodToRange("1yr");

            const [contributions, contributedNotOwnedCount, languageStats] = await Promise.all([
                fetchContributions(username, from, to, token),
                fetchContributedNotOwnedCount(username, token),
                getLanguageStats(username, token),
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

        const { token, isOwnPrivateData } = await resolveAccess(request, env, username);

        const year = yearParam ? parseInt(yearParam, 10) : undefined;
        const cacheKey = `recap:${type}:${username}${year ? `:${year}` : ""}:${isOwnPrivateData ? "private" : "public"}`;

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
                fetchContributions(username, from, to, token),
                fetchContributions(username, prevFrom, prevTo, token),
                getLanguageStats(username, token, from),
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

    if (url.pathname === "/auth/login") {
        const state = await createOAuthState(env);
        const authorizeUrl = buildAuthorizeUrl(env.GITHUB_OAUTH_CLIENT_ID, state);
        return Response.redirect(authorizeUrl, 302);
    }

    if (url.pathname === "/auth/callback") {
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (!code || !state) {
            return new Response("Missing code or state", { status: 400 });
        }

        const stateIsValid = await verifyAndConsumeOAuthState(env, state);
        if (!stateIsValid) {
            return new Response("Invalid or expired state", { status: 400 });
        }

        try {
            const accessToken = await exchangeCodeForToken(code, env);
            const username = await fetchAuthenticatedUsername(accessToken);
            const sessionId = await createSession(env, { accessToken, username });

            const headers = new Headers({ Location: `${FRONTEND_URL}/${username}` });
            headers.append("Set-Cookie", buildSessionCookie(SESSION_COOKIE_NAME, sessionId, SESSION_TTL_SECONDS));

            return new Response(null, { status: 302, headers });
        } catch (err) {
            return new Response(`Sign in failed: ${String(err)}`, { status: 502 });
        }
    }

    if (url.pathname === "/auth/logout") {
        const sessionId = getCookie(request, SESSION_COOKIE_NAME);
        if (sessionId) await deleteSession(env, sessionId);

        const headers = new Headers({ Location: FRONTEND_URL });
        headers.append("Set-Cookie", buildExpiredSessionCookie(SESSION_COOKIE_NAME));

        return new Response(null, { status: 302, headers });
    }

    if (url.pathname === "/auth/me") {
        const sessionId = getCookie(request, SESSION_COOKIE_NAME);
        const session = sessionId ? await getSession(env, sessionId) : null;

        return new Response(
            JSON.stringify(session ? { signedIn: true, username: session.username } : { signedIn: false }),
            { headers: { "Content-Type": "application/json" } },
        );
    }

    return new Response("Not found", { status: 404 });
}
