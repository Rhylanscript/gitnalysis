export interface Env {
    GITHUB_TOKEN: string;
    GITHUB_OAUTH_CLIENT_ID: string;
    GITHUB_OAUTH_CLIENT_SECRET: string;
    GITHUB_OAUTH_CALLBACK_URL: string;
    FRONTEND_URL: string;
    STATS_CACHE: KVNamespace;
    SESSIONS: KVNamespace;
}
