import { monthRange, weekRange, yearRange } from "./period";

export type RecapType = "week" | "month" | "year";

export function getRecapRange(type: RecapType, year?: number): { from: string; to: string } {
    switch (type) {
        case "week":    return weekRange(1);
        case "month":   return monthRange(1);
        case "year":    return yearRange(year ?? new Date().getFullYear());
    }
}

export function getPreviousRecapRange(type: RecapType, year?: number): { from: string; to: string; } {
    switch (type) {
        case "week":    return weekRange(2);
        case "month":   return monthRange(2);
        case "year":    return yearRange((year ?? new Date().getFullYear()) - 1);
    }
}
