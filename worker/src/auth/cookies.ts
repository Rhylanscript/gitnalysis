export function getCookie(request: Request, name: string): string | null {
    const header = request.headers.get("Cookie");
    if (!header) return null;

    for (const pair of header.split(";")) {
        const [key, ...rest] = pair.trim().split("=");
        if (key === name) return rest.join("=");
    }

    return null;
}

export function buildSessionCookie(name: string, value: string, maxAgeSeconds: number): string {
    return `${name}=${value}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${maxAgeSeconds}`;
}

export function buildExpiredSessionCookie(name: string): string {
    return `${name}=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0`;
}
