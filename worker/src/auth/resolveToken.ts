import { Env } from "../types";
import { getSession } from "./session";
import { getCookie } from "./cookies";
import { SESSION_COOKIE_NAME } from "../config";

export interface ResolvedAccess {
    token: string;
    isOwnPrivateData: boolean;
}

export async function resolveAccess(
    request: Request, 
    env: Env, 
    requestedUsername: string,
    includePrivate: boolean,
): Promise<ResolvedAccess> {
    if (!includePrivate) {
        return { token: env.GITHUB_TOKEN, isOwnPrivateData: false };
    }

    const sessionId = getCookie(request, SESSION_COOKIE_NAME);
    const session = sessionId ? await getSession(env, sessionId) : null;

    if (session && session.username.toLowerCase() === requestedUsername.toLowerCase()) {
        return { token: session.accessToken, isOwnPrivateData: true };
    }

    return { token: env.GITHUB_TOKEN, isOwnPrivateData: false };
}
