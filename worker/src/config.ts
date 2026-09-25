// just some reused constants

// Origins allowed to make valid requests to the worker
// Wildcard (*) CORS is not usable with cookies, so this has to be an explicit list
export const ALLOWED_ORIGINS = [
    "https://gitnalysis.pages.dev",
    "http://localhost:5173",        // (vite dev server)
];

export const SESSION_COOKIE_NAME = "gitnalysis_session";
export const OAUTH_STATE_COOKIE_NAME = "gitnalysis_oauth_state";
export const SESSION_TTL_SECONDS = 60 * 60 * 7 * 24;
