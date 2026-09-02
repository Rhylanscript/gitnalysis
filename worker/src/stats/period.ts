export type Period = "7d" | "30d" | "3mo" | "6mo" | "1yr";

export function periodToRange(period: Period): { from: string; to: string } {
    const to = new Date();
    const from = new Date();

    switch (period) {
        case "7d":
            from.setDate(from.getDate() - 7);
            break;
        case "30d":
            from.setDate(from.getDate() - 30);
            break;
        case "3mo":
            from.setMonth(from.getMonth() - 3);
            break;
        case "6mo":
            from.setMonth(from.getMonth() - 6);
            break;
        case "1yr":
            from.setFullYear(from.getFullYear() - 1);
            break;
    }

    return { from: from.toISOString(), to: to.toISOString() };
}