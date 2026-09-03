const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    throw new Error("VITE_API_URL is not set — check your .env file");
}

async function apiFetch<T>(path: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`);

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed: ${response.status}`);
    }

    return response.json();
}

export type Period = "7d" | "30d" | "3mo" | "6mo" | "1yr";
export type RecapType = "week" | "month" | "year";

export interface GitHubUser {
    login: string;
    name: string | null;
    avatar_url: string;
    bio: string | null;
    public_repos: number;
    followers: number;
}

export interface ContributionDay {
    date: string;
    contributionCount: number;
}

export interface ContributionWeek {
    contributionDays: ContributionDay[];
}

export interface Stats {
    totalCommitContributions: number;
    totalIssueContributions: number;
    totalPullRequestContributions: number;
    totalPullRequestReviewContributions: number;
    totalRepositoriesWithContributedCommits: number;
    restrictedContributionsCount: number;
    contributionCalendar: {
        totalContributions: number;
        weeks: ContributionWeek[];
    };
    currentStreak: number;
    longestStreak: number;
}

export interface LanguageStats {
    languages: { name: string; bytes: number; percentage: number }[];
    byRepo: { repo: string; languages: { name: string; percentage: number }[] }[];
    reposAnalysed: number;
    totalRepos: number;
    estimate: true;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
}

export interface AchievementsResult {
    achievements: Achievement[];
    basedOnPeriod: "1yr";
}

export interface Recap extends Stats {
    recapType: RecapType;
    from: string;
    to: string;
}

export const api = {
    getUser: (username: string) =>
        apiFetch<GitHubUser>(`/api/user?username=${encodeURIComponent(username)}`),

    getStats: (username: string, period: Period = "30d") =>
        apiFetch<Stats>(
            `/api/stats?username=${encodeURIComponent(username)}&period=${period}`
        ),

    getLanguages: (username: string) =>
        apiFetch<LanguageStats>(`/api/languages?username=${encodeURIComponent(username)}`),

    getAchievements: (username: string) =>
        apiFetch<AchievementsResult>(
            `/api/achievements?username=${encodeURIComponent(username)}`
        ),

    getRecap: (username: string, type: RecapType, year?: number) =>
        apiFetch<Recap>(
            `/api/recap?username=${encodeURIComponent(username)}&type=${type}${
                year ? `&year=${year}` : ""
            }`
        ),
};

export const PERIODS: { value: Period; label: string }[] = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "3mo", label: "3 Months" },
    { value: "6mo", label: "6 Months" },
    { value: "1yr", label: "1 Year" },
];
