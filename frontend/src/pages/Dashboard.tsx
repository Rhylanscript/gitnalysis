import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export default function Dashboard() {
    const { username } = useParams<{ username: string }>();

    const { data: user, isLoading, error } = useQuery({
        queryKey: ["user", username],
        queryFn: () => api.getUser(username!),
        enabled: !!username,
    })

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
                Loading {username}'s stats...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-red-400">
                {error.message}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 p-8 text-neutral-100">
            {user && (
                <div className="flex items-center gap-4">
                    <img src={user.avatar_url} alt={user.login} className="h-16 w-16 rounded-full" />
                    <div>
                        <h1 className="text-2xl font-bold">{user.name ?? user.login}</h1>
                        <p className="text-neutral-400">@{user.login}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
