import type { Repo } from "./rest";

const CONTRIBUTIONS_QUERY = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
                totalCommitContributions
                totalIssueContributions
                totalPullRequestContributions
                totalPullRequestReviewContributions
                totalRepositoriesWithContributedCommits
                restrictedContributionsCount
                contributionCalendar {
                    totalContributions
                    weeks {
                        contributionDays {
                            date
                            contributionCount
                        }
                    }
                }
                commitContributionsByRepository(maxRepositories: 25) {
                    repository {
                        name
                    }
                    contributions {
                        totalCount
                    }
                }
                totalRepositoryContributions
            }
        }
    }
`;

export async function fetchContributions(
    username: string,
    from: string,
    to: string,
    token: string,
) {
    const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "gitnalysis",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            query: CONTRIBUTIONS_QUERY,
            variables: { username, from, to },
        }),
    });

    if (!response.ok) {
        throw new Error(`GitHub GraphQL error: ${response.status}`);
    }

    const json: any = await response.json();

    if (json.errors) {
        throw new Error(`GraphQL query errors: ${JSON.stringify(json.errors)}`);
    }

    return json.data.user.contributionsCollection;
}

async function githubGraphQL<T>(query: string, variables: Record<string, unknown>, token: string): Promise<T> {
    const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "gitnalysis",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error(`GitHub GraphQL error: ${response.status}`);
    }

    const json: any = await response.json();

    if (json.errors) {
        throw new Error(`GraphQL query errors: ${JSON.stringify(json.errors)}`);
    }

    return json.data;
}

const CONTRIBUTED_ORG_REPOS_QUERY = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
                commitContributionsByRepository(maxRepositories: 100) {
                    repository {
                        name
                        nameWithOwner
                        isFork
                        pushedAt
                        owner {
                            __typename
                        }
                    }
                }
            }
        }
    }
`;

// org repos the user has committed to, range has to be <= 1 year
export async function fetchContributedOrgRepos(
    username: string,
    from: string,
    to: string,
    token: string,
): Promise<Repo[]> {
    const data = await githubGraphQL<any>(CONTRIBUTED_ORG_REPOS_QUERY, { username, from, to }, token);

    return data.user.contributionsCollection.commitContributionsByRepository
        .map((c: any) => c.repository)
        .filter((r: any) => r.owner.__typename === "Organization")
        .map((r: any) => ({
            name: r.name,
            full_name: r.nameWithOwner,
            fork: r.isFork,
            pushed_at: r.pushedAt,
        }));
}

const CONTRIBUTED_REPOS_QUERY = `
    query($username: String!) {
        user(login: $username) {
            repositoriesContributedTo(first: 1, includeUserRepositories: false) {
                totalCount
            }
        }
    }
`;

export async function fetchContributedNotOwnedCount(username: string, token: string): Promise<number> {
    const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "gitnalysis",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            query: CONTRIBUTED_REPOS_QUERY,
            variables: { username },
        }),
    });

    if (!response.ok) {
        throw new Error(`GitHub GraphQL error: ${response.status}`);
    }

    const json: any = await response.json();

    if (json.errors) {
        throw new Error(`GraphQL query errors: ${JSON.stringify(json.errors)}`);
    }

    return json.data.user.repositoriesContributedTo.totalCount;
}
