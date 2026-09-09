interface DayPoint {
    date: string;
    contributionCount: number;
}

interface Week {
    contributionDays: DayPoint[];
}

export function calculateDayOfWeekSplit(weeks: Week[]): { weekend: number; weekday: number } {
    let weekend = 0;
    let weekday = 0;

    for (const week of weeks) {
        for (const day of week.contributionDays) {
            const dow = new Date(day.date + "T00:00:00Z").getUTCDay(); // 0 = Sun, 6 = Sat
            if (dow === 0 || dow === 6) {
                weekend += day.contributionCount;
            } else {
                weekday += day.contributionCount;
            }
        }
    }

    return { weekend, weekday };
}
