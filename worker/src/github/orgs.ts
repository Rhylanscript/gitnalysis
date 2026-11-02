// all org stuff uses the signed in user's own token

export class MissingScopeError extends Error {
    constructor() {
        super("Your sign in doesn't include organisation access, sign out and sign in again to grant it");
    }
}

export class OrgAccessError extends Error {}

// small pages, capped to stay under the 50 subrequest limit
const MEMBERS_PER_PAGE = 25;
const MAX_MEMBER_PAGES = 8;

async function orgGraphQL(query: string, variables: Record<string, unknown>, token: string): Promise<any> {
    const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "gitnalysis",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
    });

    // older sessions won't have read:org
    const scopes = response.headers.get("X-OAuth-Scopes");
    if (scopes !== null) {
        const granted = scopes.split(",").map((s) => s.trim());
        if (!granted.some((s) => s === "read:org" || s === "write:org" || s === "admin:org")) {
            throw new MissingScopeError();
        }
    }

    if (!response.ok) {
        throw new Error(`GitHub GraphQL error: ${response.status}`);
    }

    const json: any = await response.json();

    if (json.errors?.some((e: any) => e.type === "INSUFFICIENT_SCOPES")) {
        throw new MissingScopeError();
    }
    if (json.errors) {
        throw new Error(`GraphQL query errors: ${JSON.stringify(json.errors)}`);
    }

    return json.data;
}

export interface OrgSummary {
    login: string;
    name: string | null;
    avatarUrl: string;
}

const VIEWER_ORGS_QUERY = `
    query {
        viewer {
            organizations(first: 100) {
                nodes {
                    login
                    name
                    avatarUrl
                }
            }
        }
    }
`;

export async function fetchViewerOrgs(token: string): Promise<OrgSummary[]> {
    const data = await orgGraphQL(VIEWER_ORGS_QUERY, {}, token);
    return data.viewer.organizations.nodes.filter(Boolean);
}

const ORG_INFO_QUERY = `
    query($org: String!) {
        organization(login: $org) {
            id
            login
            name
            avatarUrl
            viewerIsAMember
        }
    }
`;

const ORG_MEMBERS_QUERY = `
    query($org: String!, $orgId: ID!, $from: DateTime!, $to: DateTime!, $first: Int!, $after: String) {
        organization(login: $org) {
            membersWithRole(first: $first, after: $after) {
                totalCount
                pageInfo {
                    hasNextPage
                    endCursor
                }
                nodes {
                    login
                    name
                    avatarUrl
                    contributionsCollection(from: $from, to: $to, organizationID: $orgId) {
                        totalCommitContributions
                        totalPullRequestContributions
                        totalIssueContributions
                        totalPullRequestReviewContributions
                        commitContributionsByRepository(maxRepositories: 10) {
                            repository {
                                nameWithOwner
                            }
                            contributions {
                                totalCount
                            }
                        }
                    }
                }
            }
        }
    }
`;

export interface OrgMemberStats {
    login: string;
    name: string | null;
    avatarUrl: string;
    commits: number;
    pullRequests: number;
    issues: number;
    reviews: number;
    total: number;
}

export interface OrgLeaderboard {
    org: OrgSummary;
    members: OrgMemberStats[];
    totals: { commits: number; pullRequests: number; issues: number; reviews: number; total: number };
    activeMembers: number;
    membersAnalysed: number;
    totalMembers: number;
    topRepos: { name: string; commits: number }[];
}

export async function fetchOrgLeaderboard(org: string, from: string, to: string, token: string): Promise<OrgLeaderboard> {
    const info = (await orgGraphQL(ORG_INFO_QUERY, { org }, token)).organization;

    if (!info) {
        throw new OrgAccessError("Organisation not found");
    }
    if (!info.viewerIsAMember) {
        throw new OrgAccessError("You can only view leaderboards for organisations you're a member of");
    }

    const members: OrgMemberStats[] = [];
    const repoCommits = new Map<string, number>();
    let totalMembers = 0;
    let after: string | null = null;

    for (let page = 0; page < MAX_MEMBER_PAGES; page++) {
        const data = await orgGraphQL(
            ORG_MEMBERS_QUERY,
            { org, orgId: info.id, from, to, first: MEMBERS_PER_PAGE, after },
            token,
        );
        const conn = data.organization.membersWithRole;
        totalMembers = conn.totalCount;

        for (const m of conn.nodes) {
            if (!m) continue;
            const c = m.contributionsCollection;
            const stats: OrgMemberStats = {
                login: m.login,
                name: m.name,
                avatarUrl: m.avatarUrl,
                commits: c.totalCommitContributions,
                pullRequests: c.totalPullRequestContributions,
                issues: c.totalIssueContributions,
                reviews: c.totalPullRequestReviewContributions,
                total: 0,
            };
            stats.total = stats.commits + stats.pullRequests + stats.issues + stats.reviews;
            members.push(stats);

            for (const r of c.commitContributionsByRepository) {
                const name: string = r.repository.nameWithOwner;
                if (!name.toLowerCase().startsWith(`${info.login.toLowerCase()}/`)) continue;
                repoCommits.set(name, (repoCommits.get(name) ?? 0) + r.contributions.totalCount);
            }
        }

        if (!conn.pageInfo.hasNextPage) break;
        after = conn.pageInfo.endCursor;
    }

    members.sort((a, b) => b.total - a.total || a.login.localeCompare(b.login));

    const totals = members.reduce(
        (acc, m) => ({
            commits: acc.commits + m.commits,
            pullRequests: acc.pullRequests + m.pullRequests,
            issues: acc.issues + m.issues,
            reviews: acc.reviews + m.reviews,
            total: acc.total + m.total,
        }),
        { commits: 0, pullRequests: 0, issues: 0, reviews: 0, total: 0 },
    );

    const topRepos = [...repoCommits.entries()]
        .map(([name, commits]) => ({ name, commits }))
        .sort((a, b) => b.commits - a.commits)
        .slice(0, 5);

    return {
        org: { login: info.login, name: info.name, avatarUrl: info.avatarUrl },
        members,
        totals,
        activeMembers: members.filter((m) => m.total > 0).length,
        membersAnalysed: members.length,
        totalMembers,
        topRepos,
    };
}
