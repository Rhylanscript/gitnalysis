import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ContributionWeek } from "../lib/api";

interface Props {
    weeks: ContributionWeek[];
}

interface DayPoint {
    date: string;
    label: string;
    count: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: { payload: DayPoint }[];
}

function flattenDays(weeks: ContributionWeek[]): DayPoint[] {
    return weeks.flatMap((week) => 
        week.contributionDays.map((day) => ({
            date: day.date,
            label: new Date(day.date + "T00:00:00Z").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
            }),
            count: day.contributionCount,
        }))
    );
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const point: DayPoint = payload[0].payload;

    return (
        <div className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm shadow-lg">
            <div className="font-medium text-neutral-100">{point.label}</div>
            <div className="text-neutral-400">
                {point.count} contribution{point.count === 1 ? "" : "s"}
            </div>
        </div>
    );
}

export default function ActivityGraph({ weeks }: Props) {
    const days = flattenDays(weeks);

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <h2 className="mb-4 text-sm font-medium text-neutral-400">Activity</h2>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={false}
                        axisLine={{ stroke: "#262626" }}
                    />
                    <YAxis
                        tick={{ fill: "#737373", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={30}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#262626" }} />
                    <Bar dataKey="count" fill="#4ade80" radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}