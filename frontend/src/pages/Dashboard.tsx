import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type Period } from "../lib/api";
import { useEffect, useState } from "react";
import PeriodSelector from "../components/PeriodSelector";
import StatCard from "../components/StatCard";
import PublicDataNote from "../components/PublicDataNote";
import ActivityGraph from "../components/ActivityGraph";
import PersonalRecords from "../components/PersonalRecords";
import LanguageChart from "../components/LanguageChart";
import Sidebar from "../components/Sidebar";
import { ActivityGraphSkeleton, LanguageChartSkeleton, SidebarSkeleton, StatCardSkeleton } from "../components/Skeletons";

export default function Dashboard() {
    const { username } = useParams<{ username: string }>();
    const [period, setPeriod] = useState<Period>("30d");

    const { data: user, isLoading: userLoading, error: userError } = useQuery({
        queryKey: ["user", username],
        queryFn: () => api.getUser(username!),
        enabled: !!username,
    });

    const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ["stats", username, period],
        queryFn: () => api.getStats(username!, period),
        enabled: !!username,
    });

    const { data: languageStats, isLoading: languagesLoading } = useQuery({
        queryKey: ["languages", username, period],
        queryFn: () => api.getLanguages(username!, period),
        enabled: !!username,
    });

    const { data: achievementsData } = useQuery({
        queryKey: ["achievements", username],
        queryFn: () => api.getAchievements(username!),
        enabled: !!username,
    });

    useEffect(() => {
        if (user) document.title = `${user.login} · Gitnalysis`;
    }, [user]);

    if (userError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-red-400">
                {userError.message}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 p-8 text-neutral-100">
            <div className="flex flex-col gap-6 lg:flex-row">
                {userLoading ? (
                    <SidebarSkeleton />
                ) : (
                    user && (
                        <div className="fade-up">
                            <Sidebar user={user} achievements={achievementsData?.achievements} />
                        </div>
                    )
                )}

                <div className="min-w-0 flex-1">
                    <div className="mb-6 flex justify-end">
                        <PeriodSelector value={period} onChange={setPeriod} />
                    </div>

                    {statsError && <p className="text-red-400">{statsError.message}</p>}

                    {statsLoading || userLoading ? (
                        <>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <StatCardSkeleton key={i} />
                                ))}
                            </div>
                            <div className="mt-4">
                                <ActivityGraphSkeleton />
                            </div>
                        </>
                    ) : (
                        stats && (
                            <div className="fade-up">
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
                                <div className="mt-4">
                                    <PersonalRecords
                                        records={stats.records}
                                        showWeek={period !== "7d"}
                                        showMonth={period === "6mo" || period === "1yr" || period === "3mo"}
                                    />
                                </div>
                            </div>
                        )
                    )}

                    <div className="mt-4">
                        {languagesLoading || userLoading ? (
                            <LanguageChartSkeleton />
                        ) : (
                            languageStats && (
                                <div className="fade-up">
                                    <LanguageChart
                                        languages={languageStats.languages}
                                        reposAnalysed={languageStats.reposAnalysed}
                                        totalRepos={languageStats.totalRepos}
                                        period={period}
                                    />
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}