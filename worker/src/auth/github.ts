import { Env } from "../types";
import { OAUTH_CALLBACK_URL } from "../config";

export function buildAuthorizeUrl(clientId: string, state: string): string {
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: OAUTH_CALLBACK_URL,
        scope: "read:user",
        state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, env: Env): Promise<string> {
    const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            client_id: env.GITHUB_OAUTH_CLIENT_ID,
            client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
            code,
            redirect_uri: OAUTH_CALLBACK_URL,
        }),
    });

    if (!response.ok) {
        throw new Error(`GitHub token exchange failed: ${response.status}`);
    }

    const json: any = await response.json();

    if (json.error) {
        throw new Error(`GitHub token exchange error: ${json.error_description ?? json.error}`);
    }

    return json.access_token;
}

export async function fetchAuthenticatedUsername(accessToken: string): Promise<string> {
    const response = await fetch("https://api.github.com/user", {
        headers: {
            "User-Agent": "gitnalysis",
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
        },
    });

    if (!response.ok) {
        throw new Error(`GitHub /user lookup failed: ${response.status}`);
    }

    const json: any = await response.json();
    return json.login;
}
