interface ContributionDay {
    date: string;
    contributionCount: number;
}

interface ContributionWeek {
    contributionDays: ContributionDay[];
}

export interface StreakResult {
    currentStreak: number;
    longestStreak: number;
}

export function calculateStreaks(weeks: ContributionWeek[]): StreakResult {
    const days = weeks.flatMap((w) => w.contributionDays);

    let longestStreak = 0;
    let runningStreak = 0;

    for (const day of days) {
        if (day.contributionCount > 0) {
            runningStreak += 1;
            longestStreak = Math.max(longestStreak, runningStreak);
        } else {
            runningStreak = 0;
        }
    }

    let currentStreak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].contributionCount > 0) {
            currentStreak += 1;
        } else {
            break;
        }
    }

    return { currentStreak, longestStreak };
}