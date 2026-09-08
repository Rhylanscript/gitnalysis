import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getLanguageColour } from "../lib/languageColours";

interface Language {
    name: string;
    bytes: number;
    percentage: number;
}

interface Props {
    languages: Language[];
    reposAnalysed: number;
    totalRepos: number;
    period: string;
}

const OTHER_THRESHOLD = 0.5;
const OTHER_COLOUR = "#8b8b8b";

function groupSmallLanguages(languages: Language[]) {
    const big = languages.filter((l) => l.percentage >= OTHER_THRESHOLD);
    const small = languages.filter((l) => l.percentage < OTHER_THRESHOLD);

    if (small.length === 0) return { display: languages, other: [] as Language[] };

    const otherPercentage = Math.round(small.reduce((sum, l) => sum + l.percentage, 0) * 10) / 10;
    return {
        display: [...big, { name: "Other", bytes: 0, percentage: otherPercentage }],
        other: small,
    };
}

export default function LanguageChart({ languages, reposAnalysed, totalRepos, period }: Props) {
    if (languages.length === 0) {
        return (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <h2 className="mb-2 text-sm font-medium text-neutral-400">Top Languages</h2>
                <p className="text-sm text-neutral-500">No repository activity in this period.</p>
            </div>
        );
    }

    const { display, other } = groupSmallLanguages(languages);
    const top3 = languages.slice(0, 3);
    const rest = languages.slice(3);

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <h2 className="mb-4 text-sm font-medium text-neutral-400">Top languages</h2>

            <div className="flex flex-wrap gap-6">
                <div className="h-45 w-45 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={display}
                                dataKey="percentage"
                                nameKey="name"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={2}
                                strokeWidth={0}
                            >
                                {display.map((lang) => (
                                    <Cell
                                        key={lang.name}
                                        fill={lang.name === "Other" ? OTHER_COLOUR : getLanguageColour(lang.name)}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const { name, value } = payload[0];

                                    return (
                                        <div className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm shadow-lg">
                                            <div className="font-medium text-neutral-100">
                                                {name} · {value}%
                                            </div>
                                            {name === "Other" && other.length > 0 && (
                                                <div className="mt-1 flex flex-col gap-0.5 text-neutral-500">
                                                    {other.map((l) => (
                                                        <div key={l.name}>
                                                            {l.name} · {l.percentage}%
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        {top3.map((lang, i) => (
                            <div key={lang.name} className="flex items-center gap-2">
                                <span className="w-4 text-xs font-semibold text-neutral-600">#{i + 1}</span>
                                <span
                                    className="h-3 w-3 shrink-0 rounded-full"
                                    style={{ backgroundColor: getLanguageColour(lang.name) }}
                                />
                                <span className="font-medium text-neutral-100">{lang.name}</span>
                                <span className="font-mono tabular-nums text-sm text-neutral-500">{lang.percentage}%</span>
                            </div>
                        ))}
                    </div>

                    {rest.length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-neutral-800 pt-3">
                            {rest.map((lang) => (
                                <div key={lang.name} className="flex items-center gap-1.5">
                                    <span
                                        className="h-2 w-2 shrink-0 rounded-full"
                                        style={{ backgroundColor: getLanguageColour(lang.name) }}
                                    />
                                    <span className="text-xs text-neutral-400">{lang.name}</span>
                                    <span className="font-mono tabular-nums text-xs text-neutral-600">{lang.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {reposAnalysed < totalRepos && (
                <p className="mt-4 text-xs text-neutral-500">
                    Estimated from your {reposAnalysed} most active repos out of {totalRepos}
                    {period !== "all" ? " active in this period" : ""}.
                </p>
            )}
        </div>
    );
}
