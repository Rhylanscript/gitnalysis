import { fetchContributedOrgRepos } from "../github/graphql";
import { fetchRepoLanguages, fetchUserRepos, Repo } from "../github/rest";
import { aggregateLanguages, LanguageStats } from "./languages";
import { periodToRange } from "./period";

const MAX_REPOS_FOR_LANGUAGES = 30;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// included: org repos were merged in
// partial: some org repos were hidden because their org restricts third-party apps
// unavailable: org repo lookup failed, stats are from owned repos only
// not_requested: anonymous / someone else's profile, org repos are never looked up
export type OrgReposStatus = "included" | "partial" | "unavailable" | "not_requested";

export interface LanguageStatsResult extends LanguageStats {
    reposAnalysed: number;
    totalRepos: number;
    orgReposStatus: OrgReposStatus;
    warning?: string;
}

const PARTIAL_WARNING =
    "Some organisation repos were left out because their organisation restricts third-party apps and hasn't approved Gitnalysis";
const UNAVAILABLE_WARNING = "Organisation repos couldn't be loaded right now, so these stats only include your own repos";

// graphql caps ranges at 1 year, clamp `to` so past year recaps still work
function orgReposRange(sinceDate?: string): { from: string; to: string } {
    const from = sinceDate ?? periodToRange("1yr").from;
    const to = Math.min(Date.now(), new Date(from).getTime() + ONE_YEAR_MS - 1);
    return { from, to: new Date(to).toISOString() };
}

export async function getLanguageStats(
    username: string,
    token: string,
    useAuthenticatedEndpoint: boolean,
    sinceDate?: string,
): Promise<LanguageStatsResult> {
    let repos: Repo[];
    let orgReposStatus: OrgReposStatus = "not_requested";

    if (useAuthenticatedEndpoint) {
        // only org repos you've actually committed to
        // org repos are optional extras, a failure there shouldn't lose the owned repo stats
        const { from, to } = orgReposRange(sinceDate);
        const [ownedRepos, orgResult] = await Promise.all([
            fetchUserRepos(username, token, true),
            fetchContributedOrgRepos(username, from, to, token).catch((err) => {
                console.warn(`Org repo lookup failed for ${username}:`, err);
                return null;
            }),
        ]);

        const orgRepos = orgResult?.repos ?? [];
        orgReposStatus = !orgResult ? "unavailable" : orgResult.restricted ? "partial" : "included";

        const owned = new Set(ownedRepos.map((r) => r.full_name.toLowerCase()));
        const extraOrgRepos = orgRepos
            .filter((r) => !owned.has(r.full_name.toLowerCase()))
            .map((r) => ({ ...r, name: r.full_name })); // owner/name for org repos

        repos = [...ownedRepos, ...extraOrgRepos].sort(
            (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(),
        );
    } else {
        repos = await fetchUserRepos(username, token, false);
    }

    let candidateRepos = repos.filter((r) => !r.fork);

    if (sinceDate) {
        candidateRepos = candidateRepos.filter((r) => new Date(r.pushed_at) >= new Date(sinceDate));
    }

    const limitedRepos = candidateRepos.slice(0, MAX_REPOS_FOR_LANGUAGES);

    const repoLanguages = await Promise.all(
        limitedRepos.map(async (repo) => ({
            repo: repo.name,
            languages: await fetchRepoLanguages(repo.full_name, token),
        }))
    );

    const stats = aggregateLanguages(repoLanguages);
    const warning =
        orgReposStatus === "partial" ? PARTIAL_WARNING : orgReposStatus === "unavailable" ? UNAVAILABLE_WARNING : undefined;

    return {
        ...stats,
        reposAnalysed: limitedRepos.length,
        totalRepos: repos.length,
        orgReposStatus,
        ...(warning ? { warning } : {}),
    };
}
