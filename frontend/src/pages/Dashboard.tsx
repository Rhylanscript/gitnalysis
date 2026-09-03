import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type Period } from "../lib/api";
import { useState } from "react";
import PeriodSelector from "../components/PeriodSelector";
import StatCard from "../components/StatCard";
import PublicDataNote from "../components/PublicDataNote";
import ActivityGraph from "../components/ActivityGraph";

export default function Dashboard() {
    const { username } = useParams<{ username: string }>();
    const [period, setPeriod] = useState<Period>("30d");

    const { data: user, isLoading: userLoading, error: userError } = useQuery({
        queryKey: ["user", username],
        queryFn: () => api.getUser(username!),
        enabled: !!username,
    })

    const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ["stats", username, period],
        queryFn: () => api.getStats(username!, period),
        enabled: !!username,
    })

    if (userLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
                Loading {username}'s stats...
            </div>
        );
    }

    if (userError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-red-400">
                {userError.message}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 p-8 text-neutral-100">
            {user && (
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <img src={user.avatar_url} alt={user.login} className="h-16 w-16 rounded-full" />
                        <div>
                            <h1 className="text-2xl font-bold">{user.name ?? user.login}</h1>
                            <p className="text-neutral-400">@{user.login}</p>
                        </div>
                    </div>
                    <PeriodSelector value={period} onChange={setPeriod} />
                </div>
            )}

            {statsLoading && <p className="text-neutral-400">Loading stats...</p>}
            {statsError && <p className="text-red-400">{statsError.message}</p>}

            {stats && (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        <StatCard label="Commits" value={stats.totalCommitContributions} />
                        <StatCard label="Pull Requests" value={stats.totalPullRequestContributions} />
                        <StatCard label="Issues" value={stats.totalIssueContributions} />
                        <StatCard label="Reviews" value={stats.totalPullRequestReviewContributions} />
                        <StatCard label="Repos" value={stats.totalRepositoriesWithContributedCommits} />
                        <StatCard label="Current streak" value={stats.currentStreak} />
                    </div>
                    <PublicDataNote restrictedCount={stats.restrictedContributionsCount} />
                    <ActivityGraph weeks={stats.contributionCalendar.weeks} />
                </>
            )}
        </div>
    );
}
