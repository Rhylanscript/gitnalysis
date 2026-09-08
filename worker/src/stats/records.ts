interface ContributionDay {
    date: string;
    contributionCount: number;
}

interface ContributionWeek {
    contributionDays: ContributionDay[];
}

interface RepoCommitContribution {
    repository: { name: string };
    contributions: { totalCount: number };
}

export interface PersonalRecords {
    mostCommitsInADay: { date: string; count: number } | null;
    mostCommitsInAWeek: { weekStart: string; count: number } | null;
    mostActiveMonth: { month: string; count: number } | null;
    mostActiveRepo: { name: string; count: number } | null;
    topRepos: { name: string; count: number }[];
    activeDays: { active: number; total: number };
}

export function calculateRecords(
    weeks: ContributionWeek[],
    repoContributions: RepoCommitContribution[]
): PersonalRecords {
    const allDays = weeks.flatMap((w) => w.contributionDays);

    const mostCommitsInADay = allDays.reduce<{ date: string; count: number } | null>(
        (best, day) =>
            !best || day.contributionCount > best.count
                ? { date: day.date, count: day.contributionCount }
                : best,
            null
    );

    const mostCommitsInAWeek = weeks.reduce<{ weekStart: string; count: number } | null>(
        (best, week) => {
            const total = week.contributionDays.reduce((sum, d) => sum + d.contributionCount, 0);
            const weekStart = week.contributionDays[0]?.date;
            if (!weekStart) return best;
            return !best || total > best.count ? { weekStart, count: total } : best;
        },
        null
    );

    const byMonth = new Map<string, number>();
    for (const day of allDays) {
        const month = day.date.slice(0, 7);
        byMonth.set(month, (byMonth.get(month) ?? 0) + day.contributionCount);
    }
    let mostActiveMonth: { month: string; count: number } | null = null;
    for (const [month, count] of byMonth) {
        if (!mostActiveMonth || count > mostActiveMonth.count) {
            mostActiveMonth = { month, count };
        }
    }

    const mostActiveRepo = repoContributions.reduce<{ name: string; count: number } | null>(
        (best, repo) =>
            !best || repo.contributions.totalCount > best.count
                ? { name: repo.repository.name, count: repo.contributions.totalCount }
                : best, 
            null
    );

    const topRepos = [...repoContributions]
        .sort((a, b) => b.contributions.totalCount - a.contributions.totalCount)
        .slice(0, 5)
        .map((r) => ({ name: r.repository.name, count: r.contributions.totalCount }));

    const activeDays = {
        active: allDays.filter((d) => d.contributionCount > 0).length,
        total: allDays.length,
    };

    return { mostCommitsInADay, mostCommitsInAWeek, mostActiveMonth, mostActiveRepo, topRepos, activeDays };
}
