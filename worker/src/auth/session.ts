import { Env } from "../types";
import { SESSION_TTL_SECONDS } from "../config";

export interface Session {
    accessToken: string;
    username: string;
}

export async function createSession(env: Env, session: Session): Promise<string> {
    const sessionId = crypto.randomUUID();

    await env.SESSIONS.put(`session:${sessionId}`, JSON.stringify(session), {
        expirationTtl: SESSION_TTL_SECONDS,
    });

    return sessionId;
}

export async function getSession(env: Env, sessionId: string): Promise<Session | null> {
    const raw = await env.SESSIONS.get(`session:${sessionId}`);
    return raw ? (JSON.parse(raw) as Session) : null;
}

export async function deleteSession(env: Env, sessionId: string): Promise<void> {
    await env.SESSIONS.delete(`session:${sessionId}`);
}

const STATE_TTL_SECONDS = 60 * 10;

export async function createOAuthState(env: Env): Promise<string> {
    const state = crypto.randomUUID();
    await env.SESSIONS.put(`oauth_state:${state}`, "1", { expirationTtl: STATE_TTL_SECONDS });
    return state;
}

export async function verifyAndConsumeOAuthState(env: Env, state: string): Promise<boolean> {
    const key = `oauth_state:${state}`;
    const exists = await env.SESSIONS.get(key);
    if (!exists) return false;

    await env.SESSIONS.delete(key);
    return true;
}
