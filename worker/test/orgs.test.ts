import { afterEach, describe, expect, it, vi } from "vitest";
import { orgErrorResponse } from "../src/github/orgErrors";
import {
    fetchOrgLeaderboard,
    fetchViewerOrgs,
    isOAuthRestrictionError,
    MissingScopeError,
    OrgAccessError,
    OrgRestrictedError,
} from "../src/github/orgs";

// what GitHub sends back when an org has OAuth App access restrictions on and hasn't approved the app
const RESTRICTED_MESSAGE =
    "Although you appear to have the correct authorization credentials, the `BotBuilders-Robotics` organization has enabled OAuth App access restrictions, meaning that data access to third-parties is limited. For more information on these restrictions, including how to approve this app, visit https://docs.github.com/articles/restricting-access-to-your-organization-s-data/";

function restrictionError(path: string[]) {
    return { type: "FORBIDDEN", path, extensions: { saml_failure: false }, locations: [{ line: 3, column: 9 }], message: RESTRICTED_MESSAGE };
}

function graphQLResponse(body: unknown, scopes = "read:user, repo, read:org"): Response {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-OAuth-Scopes": scopes },
    });
}

function mockFetch(...responses: Response[]) {
    const fn = vi.fn();
    for (const r of responses) fn.mockResolvedValueOnce(r);
    vi.stubGlobal("fetch", fn);
    return fn;
}

const FROM = "2026-10-01T00:00:00Z";
const TO = "2026-10-31T00:00:00Z";

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("isOAuthRestrictionError", () => {
    it("matches GitHub's OAuth App restriction error", () => {
        expect(isOAuthRestrictionError(restrictionError(["organization"]))).toBe(true);
    });

    it("ignores other FORBIDDEN errors and other error types", () => {
        expect(isOAuthRestrictionError({ type: "FORBIDDEN", message: "Resource not accessible by integration" })).toBe(false);
        expect(isOAuthRestrictionError({ type: "INSUFFICIENT_SCOPES", message: RESTRICTED_MESSAGE })).toBe(false);
        expect(isOAuthRestrictionError(undefined)).toBe(false);
    });
});

describe("fetchOrgLeaderboard", () => {
    it("throws OrgRestrictedError when the org restricts OAuth apps", async () => {
        mockFetch(graphQLResponse({ data: { organization: null }, errors: [restrictionError(["organization"])] }));

        const result = fetchOrgLeaderboard("BotBuilders-Robotics", FROM, TO, "token");

        await expect(result).rejects.toBeInstanceOf(OrgRestrictedError);
        await expect(result).rejects.not.toBeInstanceOf(MissingScopeError);
    });

    it("throws OrgRestrictedError when the restriction only shows up on the members query", async () => {
        mockFetch(
            graphQLResponse({
                data: {
                    organization: {
                        id: "O_1",
                        login: "BotBuilders-Robotics",
                        name: "BotBuilders",
                        avatarUrl: "https://example.com/a.png",
                        viewerIsAMember: true,
                    },
                },
            }),
            graphQLResponse({
                data: { organization: { membersWithRole: null } },
                errors: [restrictionError(["organization", "membersWithRole"])],
            }),
        );

        const err = await fetchOrgLeaderboard("BotBuilders-Robotics", FROM, TO, "token").catch((e) => e);

        expect(err).toBeInstanceOf(OrgRestrictedError);
        expect(err.org).toBe("BotBuilders-Robotics");
    });

    it("still reports a missing read:org scope as MissingScopeError", async () => {
        mockFetch(graphQLResponse({ data: {} }, "read:user, repo"));

        await expect(fetchOrgLeaderboard("acme", FROM, TO, "token")).rejects.toBeInstanceOf(MissingScopeError);
    });
});

describe("fetchViewerOrgs", () => {
    it("keeps the orgs it can see when another org is restricted", async () => {
        mockFetch(
            graphQLResponse({
                data: {
                    viewer: {
                        organizations: {
                            nodes: [{ login: "open-org", name: "Open Org", avatarUrl: "https://example.com/o.png" }, null],
                        },
                    },
                },
                errors: [restrictionError(["viewer", "organizations", "nodes", "1"])],
            }),
        );

        const orgs = await fetchViewerOrgs("token");

        expect(orgs).toEqual([{ login: "open-org", name: "Open Org", avatarUrl: "https://example.com/o.png" }]);
    });

    it("still fails on errors that aren't restrictions", async () => {
        mockFetch(
            graphQLResponse({
                data: { viewer: { organizations: { nodes: [] } } },
                errors: [restrictionError(["viewer"]), { type: "SOMETHING_ELSE", message: "boom" }],
            }),
        );

        await expect(fetchViewerOrgs("token")).rejects.toThrow();
    });
});

describe("orgErrorResponse", () => {
    it("returns a stable code and a friendly message for restricted orgs", async () => {
        const response = orgErrorResponse(new OrgRestrictedError("BotBuilders-Robotics"));
        const body: any = await response.json();

        expect(response.status).toBe(403);
        expect(body.code).toBe("org_oauth_restricted");
        expect(body.org).toBe("BotBuilders-Robotics");
        expect(body.error).toMatch(/owner needs to approve Gitnalysis/);
    });

    it("does not leak the raw GraphQL payload for restricted orgs", async () => {
        mockFetch(graphQLResponse({ data: { organization: null }, errors: [restrictionError(["organization"])] }));
        const err = await fetchOrgLeaderboard("BotBuilders-Robotics", FROM, TO, "token").catch((e) => e);

        const text = await orgErrorResponse(err).text();

        expect(text).not.toContain("GraphQL");
        expect(text).not.toContain("FORBIDDEN");
        expect(text).not.toContain("saml_failure");
    });

    it("keeps missing_scope and org_access separate from the restriction", async () => {
        const scope: any = await orgErrorResponse(new MissingScopeError()).json();
        const access: any = await orgErrorResponse(new OrgAccessError("nope")).json();

        expect(scope.code).toBe("missing_scope");
        expect(access.code).toBe("org_access");
    });

    it("falls back to a 502 for anything else", async () => {
        const response = orgErrorResponse(new Error("GitHub GraphQL error: 500"));

        expect(response.status).toBe(502);
        expect(((await response.json()) as any).code).toBeUndefined();
    });
});
