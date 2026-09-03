import { fetchRepoLanguages, fetchUserRepos } from "../github/rest";
import { Env } from "../types";
import { aggregateLanguages, LanguageStats } from "./languages";

const MAX_REPOS_FOR_LANGUAGES = 30;

export interface LanguageStatsResult extends LanguageStats {
    reposAnalysed: number;
    totalRepos: number;
}

export async function getLanguageStats(username: string, env: Env): Promise<LanguageStatsResult> {
    const repos = await fetchUserRepos(username, env);
    const limitedRepos = repos.filter((r) => !r.fork).slice(0, MAX_REPOS_FOR_LANGUAGES);

    const repoLanguages = await Promise.all(
        limitedRepos.map(async (repo) => ({
            repo: repo.name,
            languages: await fetchRepoLanguages(repo.full_name, env),
        }))
    );

    const stats = aggregateLanguages(repoLanguages);
    return { ...stats, reposAnalysed: limitedRepos.length, totalRepos: repos.length };
}
