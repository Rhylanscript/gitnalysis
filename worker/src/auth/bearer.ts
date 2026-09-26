export function getBearerToken(request: Request): string | null {
    const header = request.headers.get("Authorization");
    if (!header?.startsWith("Bearer ")) return null;
    return header.slice("Bearer ".length).trim() || null;
}
