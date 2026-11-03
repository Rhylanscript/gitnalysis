import { MissingScopeError, OrgAccessError, OrgRestrictedError } from "./orgs";

function jsonError(body: Record<string, unknown>, status: number): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export function orgErrorResponse(err: unknown): Response {
    if (err instanceof MissingScopeError) {
        return jsonError({ error: err.message, code: "missing_scope" }, 403);
    }
    if (err instanceof OrgRestrictedError) {
        return jsonError({ error: err.message, code: "org_oauth_restricted", org: err.org ?? null }, 403);
    }
    if (err instanceof OrgAccessError) {
        return jsonError({ error: err.message, code: "org_access" }, 403);
    }
    return jsonError({ error: String(err) }, 502);
}
