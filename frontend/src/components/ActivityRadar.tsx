import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

interface Metrics {
    commits: number;
    prs: number;
    issues: number;
    reviews: number;
    repos: number;
    reposCreated: number;
}

interface Props extends Metrics {
    previous?: Metrics;
}

const LABELS: { key: keyof Metrics; label: string }[] = [
    { key: "commits", label: "Commits" },
    { key: "prs", label: "Pull Requests" },
    { key: "issues", label: "Issues" },
    { key: "reviews", label: "Reviews" },
    { key: "repos", label: "Repos" },
    { key: "reposCreated", label: "New Repos" },
];

export default function ActivityRadar({
    commits,
    prs,
    issues,
    reviews,
    repos,
    reposCreated,
    previous,
}: Props) {
    const current: Metrics = { commits, prs, issues, reviews, repos, reposCreated };

    const max = Math.max(
        ...LABELS.map((l) => current[l.key]),
        ...(previous ? LABELS.map((l) => previous[l.key]) : []),
        1,
    );

    const data = LABELS.map((l) => ({
        label: l.label,
        actual: current[l.key],
        value: Math.round((current[l.key] / max) * 100),
        previousActual: previous?.[l.key],
        previousValue: previous ? Math.round((previous[l.key] / max) * 100) : undefined,
    }));

    return (
        <div className="mx-auto h-120 w-full max-w-2xl">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} outerRadius="80%">
                    <PolarGrid stroke="#262626" />
                    <PolarAngleAxis dataKey="label" tick={{ fill: "#a3a3a3", fontSize: 14 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />

                    {previous && (
                        <Radar
                            name="Last period"
                            dataKey="previousValue"
                            stroke="#737373"
                            fill="#737373"
                            fillOpacity={0.35}
                            //strokeDasharray="4 3"
                            dot={{ r: 4, fill: "#737373", strokeWidth: 0, fillOpacity: 1 }}
                        />
                    )}

                    <Radar
                        name="This period"
                        dataKey="value"
                        stroke="#4ade80"
                        fill="#4ade80"
                        fillOpacity={0.35}
                        dot={{ r: 4, fill: "#4ade80", strokeWidth: 0, fillOpacity: 1 }}
                    />

                    {previous && <Legend wrapperStyle={{ fontSize: 13 }} />}

                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const point = payload[0].payload as {
                                label: string;
                                actual: number;
                                previousActual?: number;
                            };
                            return (
                                <div className="rounded-md border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm shadow-lg">
                                    <div className="font-medium text-neutral-100">{point.label}</div>
                                    <div className="text-neutral-400">This period: {point.actual}</div>
                                    {point.previousActual !== undefined && (
                                        <div className="text-neutral-500">Last period: {point.previousActual}</div>
                                    )}
                                </div>
                            );
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
