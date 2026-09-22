import { fetchRepoLanguages, fetchUserRepos } from "../github/rest";
import { Env } from "../types";
import { aggregateLanguages, LanguageStats } from "./languages";
import { Period, periodToRange } from "./period";

const MAX_REPOS_FOR_LANGUAGES = 30;

export interface LanguageStatsResult extends LanguageStats {
    reposAnalysed: number;
    totalRepos: number;
}

export async function getLanguageStats(
    username: string, 
    token: string,
    sinceDate?: string,
): Promise<LanguageStatsResult> {
    const repos = await fetchUserRepos(username, token);
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
    return { ...stats, reposAnalysed: limitedRepos.length, totalRepos: repos.length };
}
