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

export function weekRange(weeksAgo: number): { from: string, to: string } {
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // where 0 = sunday ... 6 = saturday
    const daysSinceSaturday = (dayOfWeek - 6 + 7) % 7;  // tuff is calling

    const thisSaturday = new Date(
        Date.UTC(
            now.getUTCFullYear(), 
            now.getUTCMonth(), 
            now.getUTCDate() - daysSinceSaturday
        )
    );
    const targetSaturday = new Date(thisSaturday);
    targetSaturday.setUTCDate(thisSaturday.getUTCDate() - 7 * weeksAgo);
    const endOfTargetWeek = new Date(targetSaturday.getTime() + 7 * 24 * 60 * 60 * 1000 - 1); // eo last friyay

    return { from: targetSaturday.toISOString(), to: endOfTargetWeek.toISOString() };
}

export function monthRange(monthsAgo: number): { from: string; to: string } {
    const now = new Date();
    const firstOfTargetMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
    const firstOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo + 1, 1));
    const lastOfTargetMonth  = new Date(firstOfNextMonth.getTime() - 1);

    return { from: firstOfTargetMonth.toISOString(), to: lastOfTargetMonth.toISOString() };
}

export function yearRange(year: number): { from: string; to: string } {
    const from = new Date(Date.UTC(year, 0, 1)).toISOString();
    const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString();
    return { from: from, to: to };
}
