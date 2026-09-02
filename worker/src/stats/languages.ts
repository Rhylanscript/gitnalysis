export interface LanguageStats {
    languages: { name: string; bytes: number; percentage: number }[];
    byRepo: { repo: string; languages: { name: string; percentage: number }[] }[];
}

export function aggregateLanguages(
    repoLanguages: { repo: string; languages: Record<string, number> }[]
): LanguageStats {
    const totals: Record<string, number> = {};

    const byRepo = repoLanguages.map(({ repo, languages }) => {
        const repoTotal = Object.values(languages).reduce((a, b) => a + b, 0);
        for (const [lang, bytes] of Object.entries(languages)) {
            totals[lang] = (totals[lang] ?? 0) + bytes;
        }

        return {
            repo,
            languages: Object.entries(languages).map(([name, bytes]) => ({
                name,
                percentage: repoTotal > 0 ? Math.round((bytes / repoTotal) * 1000) / 10 : 0,
            })),
        };
    });

    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    const languages = Object.entries(totals)
        .map(([name, bytes]) => ({
            name,
            bytes,
            percentage: grandTotal > 0 ? Math.round((bytes / grandTotal) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.bytes - a.bytes);

    return { languages, byRepo };
}
