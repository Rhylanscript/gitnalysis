import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface Props {
    username: string;
}

export default function OrgsCard({ username }: Props) {
    const { signIn } = useAuth();

    const { data, isLoading, error } = useQuery({
        queryKey: ["orgs"],
        queryFn: api.getOrgs,
        retry: false,
    });

    const missingScope = error instanceof ApiError && error.code === "missing_scope";

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <h2 className="mb-3 text-sm font-medium text-neutral-400">Organisations</h2>

            {isLoading && (
                <div className="flex animate-pulse flex-col gap-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-8 rounded-md bg-neutral-800" />
                    ))}
                </div>
            )}

            {missingScope && (
                <div className="text-xs text-neutral-500">
                    <p>Sign in again to let Gitnalysis see your organisations.</p>
                    <button
                        onClick={signIn}
                        className="mt-2 font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                        Grant org access
                    </button>
                </div>
            )}

            {error && !missingScope && <p className="text-xs text-red-400">{error.message}</p>}

            {data && data.orgs.length === 0 && (
                <p className="text-xs text-neutral-500">
                    No organisations found. Orgs that restrict third party apps need an owner to approve Gitnalysis first.
                </p>
            )}

            {data && data.orgs.length > 0 && (
                <div className="flex flex-col gap-1">
                    {data.orgs.map((org) => (
                        <Link
                            key={org.login}
                            to={`/${username}/orgs/${org.login}`}
                            className="group flex items-center gap-3 rounded-md p-2 hover:bg-neutral-800"
                        >
                            <img src={org.avatarUrl} alt={org.login} className="h-8 w-8 shrink-0 rounded-md" />
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-100">
                                {org.name ?? org.login}
                            </span>
                            <ChevronRight size={16} className="text-neutral-600 group-hover:text-neutral-400" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
