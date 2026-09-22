import { ALLOWED_ORIGINS } from "./config";

export function corsHeadersFor(request: Request): Headers {
    const origin = request.headers.get("Origin");
    const headers = new Headers();

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Access-Control-Allow-Credentials", "true");
        headers.set("Vary", "Origin");
    }
    return headers;
}

export function handlePreflight(request: Request): Response {
    const headers = corsHeadersFor(request);
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    return new Response(null, { status: 204, headers });
}
