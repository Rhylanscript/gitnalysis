interface Records {
    mostCommitsInADay: { date: string; count: number } | null;
    mostCommitsInAWeek: { weekStart: string; count: number } | null;
    mostActiveMonth: { month: string; count: number } | null;
    mostActiveRepo: { name: string; count: number } | null;
}

interface Props {
    records: Records;
    showWeek?: boolean;
    showMonth?: boolean;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    });
}

function formatMonth(monthStr: string): string {
    return new Date(monthStr + "-01T00:00:00Z").toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    });
}

function getWeekEnd(weekStart: string): string {
    const date = new Date(weekStart + "T00:00:00Z");
    date.setUTCDate(date.getUTCDate() + 7);
    return date.toISOString().slice(0, 10);
}

export default function PersonalRecords({ records, showWeek = true, showMonth = true }: Props) {
    if (!records) return null;

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-neutral-400">Personal records</h2>
                <span className="text-xs text-neutral-500">
                    All numbers represent Contributions
                </span>
            </div>
            <div className="flex flex-wrap gap-4">
                {records.mostCommitsInADay && (
                    <div className="min-w-30 flex-1">
                        <div className="font-mono tabular-nums text-xl font-bold text-neutral-100">
                            {records.mostCommitsInADay.count}
                        </div>
                        <div className="text-xs text-neutral-500">
                            Best day · {formatDate(records.mostCommitsInADay.date)}
                        </div>
                    </div>
                )}
                {showWeek && records.mostCommitsInAWeek && (
                    <div className="min-w-30 flex-1">
                        <div className="font-mono tabular-nums text-xl font-bold text-neutral-100">
                            {records.mostCommitsInAWeek.count}
                        </div>
                        <div className="text-xs text-neutral-500">
                            Best week (Sun-Sat) · {formatDate(records.mostCommitsInAWeek.weekStart)}-
                            {formatDate(getWeekEnd(records.mostCommitsInAWeek.weekStart))}
                        </div>
                    </div>
                )}
                {showMonth && records.mostActiveMonth && (
                    <div className="min-w-30 flex-1">
                        <div className="font-mono tabular-nums text-xl font-bold text-neutral-100">
                            {records.mostActiveMonth.count}
                        </div>
                        <div className="text-xs text-neutral-500">
                            Best month · {formatMonth(records.mostActiveMonth.month)}
                        </div>
                    </div>
                )}
                {records.mostActiveRepo && (
                    <div className="min-w-30 flex-1">
                        <div className="font-mono tabular-nums text-xl font-bold text-neutral-100">
                            {records.mostActiveRepo.count}
                        </div>
                        <div className="text-xs text-neutral-500">
                            Most active repo · {records.mostActiveRepo.name}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
