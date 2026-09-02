import { Env } from "../types";

interface Repo {
    name: string;
    full_name: string;
    fork: boolean;
}

export async function fetchUserRepos(username: string, env: Env): Promise<Repo[]> {
    const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
        {
            headers: {
                "User-Agent": "gitnalysis",
                Authorization: `Bearer ${env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github+json",
            },
        }
    );
    
    if (!response.ok) {
        throw new Error(`GitHub REST error fetching Repos: ${response.status}`);
    }

    return response.json();
}

export async function fetchRepoLanguages(
    fullname: string,
    env: Env,
): Promise<Record<string, number>> {
    const response = await fetch(`https://api.github.com/repos/${fullname}/languages`, {
        headers: {
            "User-Agent": "gitnalysis",
            Authorization: `Bearer ${env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
        },
    });

    if (!response.ok) {
        throw new Error(`GitHub REST error fetching languages for ${fullname}: ${response.status}`);
    }

    return response.json();
}
