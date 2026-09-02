import type { Env } from "./types";

const TTL_SECONDS = 60 * 15;

export async function getCached<T>(env: Env, key: string): Promise<T | null> {
    const raw = await env.STATS_CACHE.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
}

export async function setCached<T>(env: Env, key: string, value: T): Promise<void> {
    await env.STATS_CACHE.put(key, JSON.stringify(value), {
        expirationTtl: TTL_SECONDS,
    });
}
