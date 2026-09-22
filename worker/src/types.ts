export interface Env {
    GITHUB_TOKEN: string;
    GITHUB_OAUTH_CLIENT_ID: string;
    GITHUB_OAUTH_CLIENT_SECRET: string;
    STATS_CACHE: KVNamespace;
    SESSIONS: KVNamespace;
}
