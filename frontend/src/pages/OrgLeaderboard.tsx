import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { api, ApiError, type OrgMemberStats, type Period } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import PeriodSelector from "../components/PeriodSelector";
import SignInButton from "../components/SignInButton";
import StatCard from "../components/StatCard";
import { StatCardSkeleton } from "../components/Skeletons";

type SortKey = "total" | "commits" | "pullRequests" | "reviews" | "issues";

const COLUMNS: { key: SortKey; label: string; className?: string }[] = [
    { key: "total", label: "Total" },
    { key: "commits", label: "Commits" },
    { key: "pullRequests", label: "PRs", className: "hidden sm:table-cell" },
    { key: "reviews", label: "Reviews", className: "hidden sm:table-cell" },
    { key: "issues", label: "Issues", className: "hidden md:table-cell" },
];

export default function OrgLeaderboard() {
    const { username, org } = useParams<{ username: string; org: string }>();
    const [period, setPeriod] = useState<Period>("30d");
    const [sortKey, setSortKey] = useState<SortKey>("total");
    const [showInactive, setShowInactive] = useState(false);

    const { signedIn, username: authUsername, isLoading: authLoading, signIn } = useAuth();
    const isOwnProfile = signedIn && authUsername?.toLowerCase() === username?.toLowerCase();

    const { data, isLoading, error } = useQuery({
        queryKey: ["orgLeaderboard", org, period],
        queryFn: () => api.getOrgLeaderboard(org!, period),
        enabled: !!org && isOwnProfile,
        retry: false,
    });

    useEffect(() => {
        document.title = `${data?.org.name ?? org} leaderboard · Gitnalysis`;
    }, [data, org]);

    const missingScope = error instanceof ApiError && error.code === "missing_scope";

    const sorted = data
        ? [...data.members].sort((a, b) => b[sortKey] - a[sortKey] || b.total - a.total || a.login.localeCompare(b.login))
        : [];
    const visible = showInactive ? sorted : sorted.filter((m) => m.total > 0);
    const hiddenCount = sorted.length - visible.length;

    return (
        <div className="min-h-screen bg-neutral-950 p-8 text-neutral-100">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-end gap-3">
                    <Link
                        to={`/${username}`}
                        className="mr-auto flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-100"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">Back to profile</span>
                    </Link>
                    <SignInButton />
                    {isOwnProfile && <PeriodSelector value={period} onChange={setPeriod} />}
                </div>

                {!authLoading && !isOwnProfile && (
                    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-sm text-neutral-400">
                        {signedIn
                            ? `Org leaderboards are only visible from your own profile, @${authUsername}.`
                            : "Sign in with GitHub to see leaderboards for your organisations."}
                    </div>
                )}

                {missingScope && (
                    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-sm text-neutral-400">
                        <p>Your sign in doesn't include organisation access yet.</p>
                        <button
                            onClick={signIn}
                            className="mt-2 font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        >
                            Sign in again to grant it
                        </button>
                    </div>
                )}

                {error && !missingScope && <p className="text-red-400">{error.message}</p>}

                {isOwnProfile && isLoading && (
                    <>
                        <div className="mb-8 flex animate-pulse items-center gap-4">
                            <div className="h-16 w-16 rounded-lg bg-neutral-800" />
                            <div className="space-y-2">
                                <div className="h-5 w-40 rounded bg-neutral-800" />
                                <div className="h-3 w-24 rounded bg-neutral-800" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <StatCardSkeleton key={i} />
                            ))}
                        </div>
                    </>
                )}

                {data && (
                    <div className="fade-up">
                        <div className="mb-8 flex items-center gap-4">
                            <img src={data.org.avatarUrl} alt={data.org.login} className="h-16 w-16 rounded-lg" />
                            <div>
                                <h1 className="text-2xl font-bold">{data.org.name ?? data.org.login}</h1>
                                <p className="text-sm text-neutral-400">
                                    @{data.org.login} · <span className="font-mono tabular-nums">{data.totalMembers}</span> members
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                            <StatCard label="Contributions" value={data.totals.total} />
                            <StatCard label="Commits" value={data.totals.commits} />
                            <StatCard label="Pull Requests" value={data.totals.pullRequests} />
                            <StatCard label="Reviews" value={data.totals.reviews} />
                            <StatCard label="Issues" value={data.totals.issues} />
                            <StatCard label="Active members" value={`${data.activeMembers}/${data.membersAnalysed}`} />
                        </div>

                        <p className="my-2 text-xs text-neutral-500">
                            Members only, and only activity in repos you can see
                            {data.membersAnalysed < data.totalMembers &&
                                ` · showing the first ${data.membersAnalysed} of ${data.totalMembers} members`}
                        </p>

                        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_16rem]">
                            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                                <h2 className="mb-3 text-sm font-medium text-neutral-400">Top contributors</h2>

                                {visible.length === 0 ? (
                                    <p className="text-xs text-neutral-500">No member activity in this period.</p>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-xs text-neutral-500">
                                                <th className="w-8 pb-2 font-medium">#</th>
                                                <th className="pb-2 font-medium">Member</th>
                                                {COLUMNS.map((c) => (
                                                    <th key={c.key} className={`pb-2 text-right font-medium ${c.className ?? ""}`}>
                                                        <button
                                                            onClick={() => setSortKey(c.key)}
                                                            className={`inline-flex items-center gap-0.5 cursor-pointer transition-colors hover:text-neutral-100 ${
                                                                sortKey === c.key ? "text-emerald-400" : ""
                                                            }`}
                                                        >
                                                            {c.label}
                                                            {sortKey === c.key && <ChevronDown size={12} />}
                                                        </button>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visible.map((m, i) => (
                                                <MemberRow
                                                    key={m.login}
                                                    member={m}
                                                    rank={i + 1}
                                                    sortKey={sortKey}
                                                    isViewer={m.login.toLowerCase() === authUsername?.toLowerCase()}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {hiddenCount > 0 && (
                                    <button
                                        onClick={() => setShowInactive(true)}
                                        className="mt-3 text-xs font-medium text-neutral-500 hover:text-neutral-300 cursor-pointer"
                                    >
                                        Show {hiddenCount} inactive member{hiddenCount === 1 ? "" : "s"}
                                    </button>
                                )}
                            </div>

                            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                                <h2 className="mb-3 text-sm font-medium text-neutral-400">Most active repos</h2>
                                {data.topRepos.length === 0 ? (
                                    <p className="text-xs text-neutral-500">No commits in this period.</p>
                                ) : (
                                    <ol className="flex flex-col gap-2">
                                        {data.topRepos.map((r) => (
                                            <li key={r.name} className="flex items-baseline justify-between gap-2 text-sm">
                                                <span className="min-w-0 truncate text-neutral-100" title={r.name}>
                                                    {r.name.split("/")[1] ?? r.name}
                                                </span>
                                                <span className="shrink-0 font-mono text-xs tabular-nums text-neutral-500">
                                                    {r.commits} commits
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MemberRow({
    member,
    rank,
    sortKey,
    isViewer,
}: {
    member: OrgMemberStats;
    rank: number;
    sortKey: SortKey;
    isViewer: boolean;
}) {
    return (
        <tr className={`border-t border-neutral-800 ${isViewer ? "bg-emerald-500/5" : ""}`}>
            <td className="py-2 font-mono tabular-nums text-neutral-500">{rank}</td>
            <td className="py-2">
                <Link to={`/${member.login}`} className="group flex min-w-0 items-center gap-2">
                    <img src={member.avatarUrl} alt={member.login} className="h-6 w-6 shrink-0 rounded-full" />
                    <span className="truncate text-neutral-100 group-hover:text-emerald-400">
                        {member.name ?? member.login}
                    </span>
                    {isViewer && <span className="shrink-0 text-xs text-emerald-400">you</span>}
                </Link>
            </td>
            {COLUMNS.map((c) => (
                <td
                    key={c.key}
                    className={`py-2 text-right font-mono tabular-nums ${
                        sortKey === c.key ? "text-neutral-100" : "text-neutral-400"
                    } ${c.className ?? ""}`}
                >
                    {member[c.key]}
                </td>
            ))}
        </tr>
    );
}
