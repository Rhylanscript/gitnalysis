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

export function lastWeekRange(): { from: string, to: string } {
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
    const lastSaturday = new Date(thisSaturday);
    lastSaturday.setUTCDate(thisSaturday.getUTCDate() - 7);
    const dayBeforeThisSaturday = new Date(thisSaturday.getTime() - 1); // eo last friyay

    return { from: lastSaturday.toISOString(), to: dayBeforeThisSaturday.toISOString() };
}

export function lastMonthRange(): { from: string; to: string } {
    const now = new Date();
    const firstOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const firstOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const lastOfLastMonth  = new Date(firstOfThisMonth.getTime() - 1);

    return { from: firstOfLastMonth.toISOString(), to: lastOfLastMonth.toISOString() };
}

export function yearRange(year: number): { from: string; to: string } {
    const from = new Date(Date.UTC(year, 0, 1)).toISOString();
    const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString();
    return { from: from, to: to };
}
