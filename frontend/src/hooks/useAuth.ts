import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSessionToken, clearSessionToken } from "../lib/sessionToken";

const API_URL = import.meta.env.VITE_API_URL;

interface AuthState {
    signedIn: boolean;
    username?: string;
}

async function fetchAuthState(): Promise<AuthState> {
    const token = getSessionToken();
    if (!token) return { signedIn: false };

    const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
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
        const token = getSessionToken();
        if (token) {
            await fetch(`${API_URL}/auth/logout`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }
        clearSessionToken();
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
