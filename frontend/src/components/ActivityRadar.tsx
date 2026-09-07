import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
    commits: number;
    prs: number;
    issues: number;
    reviews: number;
    repos: number;
}

export default function ActivityRadar({ commits, prs, issues, reviews, repos }: Props) {
    const raw = [
        { metric: "Commits", actual: commits },
        { metric: "Pull Requests", actual: prs },
        { metric: "Issues", actual: issues },
        { metric: "Reviews", actual: reviews },
        { metric: "Repos", actual: repos },
    ];
    const max = Math.max(...raw.map((r) => r.actual), 1);
    const data = raw.map((r) => ({ ...r, value: Math.round((r.actual / max) * 100) }));

    return (
        <div className="h-70 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} outerRadius="75%">
                    <PolarGrid stroke="#262626" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#a3a3a3", fontSize: 12 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                    <Radar dataKey="value" stroke="#4ade80" fill="#4ade80" fillOpacity={0.35} />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const point = payload[0].payload as { metric: string; actual: number };
                            return (
                                <div className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm shadow-lg">
                                    <div className="font-medium text-neutral-100">{point.metric}</div>
                                    <div className="text-neutral-400">{point.actual}</div>
                                </div>
                            );
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
