// just some reused constants

// GH OAuth app only allows 1 registered callback url
export const OAUTH_CALLBACK_URL = "https://gitnalysis-worker.rhylanmarsh.workers.dev/auth/callback";

// where user is sent after a signin attempt
export const FRONTEND_URL = "https://gitnalysis.pages.dev";

// Origins allowed to make valid requests to the worker
// Wildcard (*) CORS is not usable with cookies, so this has to be an explicit list
export const ALLOWED_ORIGINS = [
    "https://gitnalysis.pages.dev",
    "http://localhost:5173",        // (vite dev server)
];

export const SESSION_COOKIE_NAME = "gitnalysis_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 7 * 24;
