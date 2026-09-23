import { useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

interface AuthState {
    signedIn: boolean;
    username?: string;
}

async function fetchAuthState(): Promise<AuthState> {
    const response = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
    });
    return response.json();
}

export function useAuth() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["auth"],
        queryFn: fetchAuthState,
    });

    function signIn() {
        window.location.href = `${API_URL}/auth/login`;
    }

    async function signOut() {
        await fetch(`${API_URL}/auth/logout`, { credentials: "include" });
        queryClient.invalidateQueries({ queryKey: ["auth"] });
    }

    return {
        signedIn: data?.signedIn ?? false,
        username: data?.username,
        isLoading,
        signIn,
        signOut,
    };
}
