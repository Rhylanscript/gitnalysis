import { Env } from "../types";
import { getSession } from "./session";
import { getBearerToken } from "./bearer";

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

    const sessionId = getBearerToken(request);
    const session = sessionId ? await getSession(env, sessionId) : null;

    if (session && session.username.toLowerCase() === requestedUsername.toLowerCase()) {
        return { token: session.accessToken, isOwnPrivateData: true };
    }

    return { token: env.GITHUB_TOKEN, isOwnPrivateData: false };
}
