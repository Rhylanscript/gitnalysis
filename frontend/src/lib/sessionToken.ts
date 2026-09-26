const STORAGE_KEY = "gitnalysis_session";

export function getSessionToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEY);
}

export function setSessionToken(token: string): void {
    sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearSessionToken(): void {
    sessionStorage.removeItem(STORAGE_KEY);
}

export function captureSessionFromUrl(): void {
    const url = new URL(window.location.href);
    const session = url.searchParams.get("session");
    if (!session) return;

    setSessionToken(session);
    url.searchParams.delete("session");
    window.history.replaceState({}, "", url.toString());
}
