import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CalendarRange, Sparkles, ChevronRight } from "lucide-react";
import type { GitHubUser, Achievement } from "../lib/api";
import AchievementBadge from "./AchievementBadge";
import Modal from "./Modal";

interface Props {
  user: GitHubUser;
  achievements?: Achievement[];
}

export default function Sidebar({ user, achievements }: Props) {
    const [showAllModal, setShowAllModal] = useState(false);

    const unlocked = achievements?.filter((a) => a.unlocked) ?? [];
    const locked = achievements?.filter((a) => !a.unlocked) ?? [];

    return (
        <aside className="flex w-full flex-col gap-6 lg:w-72 lg:shrink-0">
            <div>
                <img src={user.avatar_url} alt={user.login} className="h-24 w-24 rounded-full ring-2 ring-emerald-500/20" />
                <h1 className="mt-3 text-xl font-bold text-neutral-100">{user.name ?? user.login}</h1>
                <p className="text-neutral-400">@{user.login}</p>
                {user.bio && <p className="mt-2 text-sm text-neutral-400">{user.bio}</p>}
                <div className="mt-3 flex gap-4 text-sm text-neutral-500">
                    <span>
                        <span className="font-mono font-medium tabular-nums text-neutral-300">{user.followers}</span> followers
                    </span>
                    <span>
                        <span className="font-mono font-medium tabular-nums text-neutral-300">{user.public_repos}</span> repos
                    </span>
                </div>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <h2 className="mb-3 text-sm font-medium text-neutral-400">Recaps</h2>
                <div className="flex flex-col gap-1">
                    <Link
                        to={`/${user.login}/recap/week`}
                        className="group flex items-center gap-3 rounded-md p-2 hover:bg-neutral-800"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-neutral-400">
                            <CalendarDays size={16} />
                        </div>
                        <span className="flex-1 text-sm font-medium text-neutral-100">Week recap</span>
                        <ChevronRight size={16} className="text-neutral-600 group-hover:text-neutral-400" />
                    </Link>

                    <Link
                        to={`/${user.login}/recap/month`}
                        className="group flex items-center gap-3 rounded-md p-2 hover:bg-neutral-800"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-neutral-400">
                            <CalendarRange size={16} />
                        </div>
                        <span className="flex-1 text-sm font-medium text-neutral-100">Month recap</span>
                        <ChevronRight size={16} className="text-neutral-600 group-hover:text-neutral-400" />
                    </Link>

                    <Link
                        to={`/${user.login}/recap/year/${new Date().getFullYear() - 1}`}
                        className="group flex items-center gap-3 rounded-md p-2 hover:bg-neutral-800"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                            <Sparkles size={16} />
                        </div>
                        <span className="flex-1 text-sm font-medium text-neutral-100">Year recap</span>
                        <ChevronRight size={16} className="text-neutral-600 group-hover:text-neutral-400" />
                    </Link>
                </div>
            </div>

            {achievements && (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                    <h2 className="mb-3 text-sm font-medium text-neutral-400">
                        Achievements · <span className="font-mono tabular-nums">{unlocked.length}/{achievements.length}</span>
                    </h2>

                    {unlocked.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {unlocked.map((a) => (
                                <AchievementBadge key={a.id} {...a} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-neutral-500">No achievements unlocked yet.</p>
                    )}

                    {locked.length > 0 && (
                        <button
                            onClick={() => setShowAllModal(true)}
                            className="mt-3 w-full text-left text-xs font-medium text-neutral-500 hover:text-neutral-300"
                        >
                            View all {achievements.length} achievements
                        </button>
                    )}
                </div>
            )}

            {showAllModal && achievements && (
                <Modal title="All achievements" onClose={() => setShowAllModal(false)}>
                    <div className="flex flex-col gap-1">
                        {achievements.map((a) => (
                            <AchievementBadge key={a.id} {...a} />
                        ))}
                    </div>
                </Modal>
            )}
        </aside>
    );
}
