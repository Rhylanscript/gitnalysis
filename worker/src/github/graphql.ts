import { Env } from "../types";

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
            }
        }
    }
`;

export async function fetchContributions(
    username: string,
    from: string,
    to: string,
    env: Env,
) {
    const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "gitnalysis",
            Authorization: `Bearer ${env.GITHUB_TOKEN}`,
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

const CONTRIBUTED_REPOS_QUERY = `
    query($username: String!) {
        user(login: $username) {
            repositoriesContributedTo(first: 1, includeUserRepositories: false) {
                totalCount
            }
        }
    }
`;

export async function fetchContributedNotOwnedCount(username: string, env: Env): Promise<number> {
    const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "gitnalysis",
            Authorization: `Bearer ${env.GITHUB_TOKEN}`,
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
