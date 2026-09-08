import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type RecapType } from "../lib/api";
import ActivityRadar from "../components/ActivityRadar";
import PersonalRecords from "../components/PersonalRecords";
import LanguageChart from "../components/LanguageChart";
import PublicDataNote from "../components/PublicDataNote";
import { useEffect } from "react";

const TABS: { type: RecapType; label: string }[] = [
    { type: "week", label: "Week" },
    { type: "month", label: "Month" },
    { type: "year", label: "Year" },
];

function formatRangeLabel(type: RecapType, from: string, to: string, year?: number): string {
    if (type === "year") return String(year ?? new Date(from).getUTCFullYear());
    const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    return `${fmt(from)} - ${fmt(to)}`;
}

export default function Recap() {
    const { username, type, year } = useParams<{ username: string; type: string; year?: string }>();
    const recapType = type as RecapType;
    const parsedYear = year ? parseInt(year, 10) : undefined;
    const currentYear = new Date().getFullYear();
    const defaultCompletedYear = currentYear - 1;
    const inProgress = recapType === "year" && (parsedYear ?? defaultCompletedYear) === currentYear;

    const { data, isLoading, error } = useQuery({
        queryKey: ["recap", username, recapType, parsedYear],
        queryFn: () => api.getRecap(username!, recapType, parsedYear),
        enabled: !!username && !!recapType,
    });

    useEffect(() => {
        if (username) {
            const label = recapType === "year" ? `${parsedYear ?? defaultCompletedYear} recap` : `${recapType} recap`;
            document.title = `${username} · ${label} · Gitnalysis`;
        }
    }, [username, recapType, parsedYear, defaultCompletedYear]);

    return (
        <div className="min-h-screen bg-neutral-950 p-8 text-neutral-100">
            <div className="mx-auto max-w-3xl">
                <Link to={`/${username}`} className="text-sm text-neutral-500 hover:text-neutral-300">
                    Back to dashboard
                </Link>

                <div className="mt-4 mb-4 flex gap-1 rounded-md bg-neutral-900 p-1">
                    {TABS.map((tab) => (
                        <Link
                            key={tab.type}
                            to={
                                tab.type === "year"
                                    ? `/${username}/recap/year/${defaultCompletedYear}`
                                    : `/${username}/recap/${tab.type}`
                            }
                            className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
                                recapType === tab.type
                                    ? "bg-neutral-100 text-neutral-900"
                                    : "text-neutral-400 hover:text-neutral-100"
                            }`}
                            >
                            {tab.label}
                        </Link>
                    ))}
                </div>

                {recapType === "year" && (
                    <div className="mb-6 flex flex-wrap gap-1">
                        {Array.from({ length: 6 }, (_, i) => currentYear - i).map((y) => (
                            <Link
                                key={y}
                                to={`/${username}/recap/year/${y}`}
                                className={`rounded px-3 py-1 text-sm ${
                                    (parsedYear ?? defaultCompletedYear) === y
                                        ? "bg-neutral-100 text-neutral-900"
                                        : "bg-neutral-900 text-neutral-400 hover:text-neutral-100"
                                }`}
                            >
                                {y}
                                {y === currentYear && " (in progress)"}
                            </Link>
                        ))}
                    </div>
                )}

                {isLoading && <p className="text-neutral-400">Loading recap...</p>}
                {error && <p className="text-red-400">{error.message}</p>}

                {data && data.contributionCalendar.totalContributions === 0 && (
                    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center text-neutral-500">
                        No data available for this period.
                    </div>
                )}

                {data && data.contributionCalendar.totalContributions > 0 && (
                    <>
                        <div className="mb-8">
                            <div className="text-sm text-neutral-500">
                                {formatRangeLabel(recapType, data.from, data.to, parsedYear)}
                                {inProgress && " · in progress"}
                            </div>
                            <div className="text-5xl font-bold text-neutral-100">
                                {data.contributionCalendar.totalContributions}
                            </div>
                            <div className="text-neutral-400">contributions</div>
                        </div>

                        <PublicDataNote restrictedCount={data.restrictedContributionsCount} />

                        <div className="mb-8 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                            <h2 className="mb-2 text-sm font-medium text-neutral-400">Activity breakdown</h2>
                            <ActivityRadar
                                commits={data.totalCommitContributions}
                                prs={data.totalPullRequestContributions}
                                issues={data.totalIssueContributions}
                                reviews={data.totalPullRequestReviewContributions}
                                repos={data.totalRepositoriesWithContributedCommits}
                                reposCreated={data.totalRepositoryContributions}
                                previous={{
                                    commits: data.previous.totalCommitContributions,
                                    prs: data.previous.totalPullRequestContributions,
                                    issues: data.previous.totalIssueContributions,
                                    reviews: data.previous.totalPullRequestReviewContributions,
                                    repos: data.previous.totalRepositoriesWithContributedCommits,
                                    reposCreated: data.previous.totalRepositoryContributions,
                                }}
                            />
                        </div>

                        <div className="mb-8 grid gap-6 sm:grid-cols-2">
                            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                                <h2 className="mb-3 text-sm font-medium text-neutral-400">Top repos</h2>
                                {data.records.topRepos.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {data.records.topRepos.map((r, i) => (
                                            <div key={r.name} className="flex items-center gap-2 text-sm">
                                                <span className="w-4 text-xs font-semibold text-neutral-600">#{i + 1}</span>
                                                <span className="text-neutral-100">{r.name}</span>
                                                <span className="text-neutral-500">{r.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-neutral-500">No repository activity in this period.</p>
                                )}
                            </div>

                            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                                <h2 className="mb-1 text-sm font-medium text-neutral-400">Active days</h2>
                                <div className="text-2xl font-bold text-neutral-100">
                                    {data.records.activeDays.active} / {data.records.activeDays.total}
                                </div>
                                <div className="text-xs text-neutral-500">days with contributions</div>
                            </div>
                        </div>

                        {data.languages.length > 0 && (
                            <div className="mb-8">
                                <LanguageChart
                                    languages={data.languages}
                                    reposAnalysed={data.languages.length}
                                    totalRepos={data.languages.length}
                                    period="all"
                                />
                            </div>
                        )}

                        <PersonalRecords 
                            records={data.records} 
                            showWeek={recapType !== "week"}
                            showMonth={recapType === "year"} 
                        />
                    </>
                )}
            </div>
        </div>
    );
}
