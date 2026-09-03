import { lastMonthRange, lastWeekRange, yearRange } from "./period";

export type RecapType = "week" | "month" | "year";

export function getRecapRange(type: RecapType, year?: number): { from: string; to: string } {
    switch (type) {
        case "week":    return lastWeekRange();
        case "month":   return lastMonthRange();
        case "year":    return yearRange(year ?? new Date().getFullYear());
    }
}
