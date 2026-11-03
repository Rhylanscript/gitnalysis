import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLanguageStats } from "../src/stats/getLanguageStats";

const RESTRICTED_MESSAGE =
    "Although you appear to have the correct authorization credentials, the `BotBuilders-Robotics` organization has enabled OAuth App access restrictions, meaning that data access to third-parties is limited.";

const recent = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

const OWNED_REPOS = [{ name: "mine", full_name: "eli/mine", fork: false, pushed_at: recent }];

const LANGUAGES: Record<string, Record<string, number>> = {
    "eli/mine": { TypeScript: 3000, CSS: 1000 },
    "acme/tool": { Go: 4000 },
};

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function orgRepoNode(nameWithOwner: string) {
    const [, name] = nameWithOwner.split("/");
    return {
        repository: { name, nameWithOwner, isFork: false, pushedAt: recent, owner: { __typename: "Organization" } },
    };
}

// routes requests by url, `graphql` decides what the org repo lookup returns
function mockGitHub(graphql: () => Response | Promise<Response>) {
    const fn = vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "https://api.github.com/graphql") return graphql();
        if (url.startsWith("https://api.github.com/user/repos")) return json(OWNED_REPOS);

        const match = url.match(/^https:\/\/api\.github\.com\/repos\/(.+)\/languages$/);
        if (match) return json(LANGUAGES[match[1]] ?? {});

        throw new Error(`unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fn);
    return fn;
}

const languageNames = (stats: { languages: { name: string }[] }) => stats.languages.map((l) => l.name).sort();

beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe("getLanguageStats org repo augmentation", () => {
    it("merges contributed org repos when the lookup works", async () => {
        mockGitHub(() =>
            json({ data: { user: { contributionsCollection: { commitContributionsByRepository: [orgRepoNode("acme/tool")] } } } }),
        );

        const stats = await getLanguageStats("eli", "token", true);

        expect(stats.orgReposStatus).toBe("included");
        expect(stats.warning).toBeUndefined();
        expect(languageNames(stats)).toEqual(["CSS", "Go", "TypeScript"]);
        expect(stats.totalRepos).toBe(2);
    });

    it("keeps owned repo stats with a warning when the org lookup returns a GraphQL error", async () => {
        mockGitHub(() => json({ data: null, errors: [{ type: "SOMETHING_ELSE", message: "boom" }] }));

        const stats = await getLanguageStats("eli", "token", true);

        expect(stats.orgReposStatus).toBe("unavailable");
        expect(stats.warning).toMatch(/only include your own repos/);
        expect(languageNames(stats)).toEqual(["CSS", "TypeScript"]);
        expect(stats.totalRepos).toBe(1);
    });

    it("keeps owned repo stats when the org lookup fails at the HTTP level", async () => {
        mockGitHub(() => json({ message: "Bad gateway" }, 502));

        const stats = await getLanguageStats("eli", "token", true);

        expect(stats.orgReposStatus).toBe("unavailable");
        expect(languageNames(stats)).toEqual(["CSS", "TypeScript"]);
    });

    it("keeps owned repo stats when the org lookup throws", async () => {
        mockGitHub(() => Promise.reject(new TypeError("network down")));

        const stats = await getLanguageStats("eli", "token", true);

        expect(stats.orgReposStatus).toBe("unavailable");
        expect(languageNames(stats)).toEqual(["CSS", "TypeScript"]);
    });

    it("keeps the visible org repos and flags partial results when an org restricts OAuth apps", async () => {
        mockGitHub(() =>
            json({
                data: {
                    user: {
                        contributionsCollection: {
                            commitContributionsByRepository: [orgRepoNode("acme/tool"), { repository: null }],
                        },
                    },
                },
                errors: [
                    {
                        type: "FORBIDDEN",
                        path: ["user", "contributionsCollection", "commitContributionsByRepository", 1, "repository"],
                        message: RESTRICTED_MESSAGE,
                    },
                ],
            }),
        );

        const stats = await getLanguageStats("eli", "token", true);

        expect(stats.orgReposStatus).toBe("partial");
        expect(stats.warning).toMatch(/restricts third-party apps/);
        expect(languageNames(stats)).toEqual(["CSS", "Go", "TypeScript"]);
    });

    it("still fails when the owned repos can't be loaded", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async (input: RequestInfo | URL) =>
                String(input).startsWith("https://api.github.com/user/repos") ? json({}, 500) : json({ data: {} }),
            ),
        );

        await expect(getLanguageStats("eli", "token", true)).rejects.toThrow(/fetching Repos/);
    });

    it("never looks up org repos for public stats", async () => {
        const fn = vi.fn(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.startsWith("https://api.github.com/users/eli/repos")) return json(OWNED_REPOS);
            if (url.endsWith("/languages")) return json(LANGUAGES["eli/mine"]);
            throw new Error(`unexpected fetch ${url}`);
        });
        vi.stubGlobal("fetch", fn);

        const stats = await getLanguageStats("eli", "token", false);

        expect(stats.orgReposStatus).toBe("not_requested");
        expect(fn.mock.calls.some(([url]) => String(url).includes("graphql"))).toBe(false);
    });
});
