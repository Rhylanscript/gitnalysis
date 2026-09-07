import type { GitHubUser, Achievement } from "../lib/api";
import AchievementBadge from "./AchievementBadge";

interface Props {
    user: GitHubUser;
    achievements?: Achievement[];
}

export default function Sidebar({ user, achievements }: Props) {
    const unlockedCount = achievements?.filter((a) => a.unlocked).length ?? 0;

    return (
        <aside className="flex w-full flex-col gap-6 lg:w-72 lg:shrink-0">
            <div>
                <img src={user.avatar_url} alt={user.login} className="h-24 w-24 rounded-full" />
                <h1 className="mt-3 text-xl font-bold text-neutral-100">{user.name ?? user.login}</h1>
                <p className="text-neutral-400">@{user.login}</p>
                {user.bio && <p className="mt-2 text-sm text-neutral-400">{user.bio}</p>}
                <div className="mt-3 flex gap-4 text-sm text-neutral-500">
                    <span>
                        <span className="font-medium text-neutral-300">{user.followers}</span> followers
                    </span>
                    <span>
                        <span className="font-medium text-neutral-300">{user.public_repos}</span> repos
                    </span>
                </div>
            </div>

            {achievements && (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                    <h2 className="mb-3 text-sm font-medium text-neutral-400">
                        Achievements · {unlockedCount}/{achievements.length}
                    </h2>
                    <div className="flex flex-col gap-1">
                        {achievements.map((a) => (
                            <AchievementBadge key={a.id} {...a} />
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
}
