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
}

export default function LanguageChart({ languages, reposAnalysed, totalRepos }: Props) {
    const top = languages.slice(0, 3);

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <h2 className="mb-4 text-sm font-medium text-neutral-400">Top languages</h2>

            <div className="flex flex-wrap items-center gap-6">
                <div className="h-45 w-45 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={languages}
                                dataKey="percentage"
                                nameKey="name"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={2}
                                strokeWidth={0}
                            >
                                {languages.map((lang) => (
                                    <Cell key={lang.name} fill={getLanguageColour(lang.name)} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [`${value}%`, name]}
                                contentStyle={{
                                background: "#171717",
                                border: "1px solid #262626",
                                borderRadius: 6,
                                fontSize: 13,
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-3">
                    {top.map((lang) => (
                        <div key={lang.name} className="flex items-center gap-2">
                            <span
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: getLanguageColour(lang.name) }}
                            />
                            <span className="font-medium text-neutral-100">{lang.name}</span>
                            <span className="text-sm text-neutral-500">{lang.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {reposAnalysed < totalRepos && (
                <p className="mt-4 text-xs text-neutral-500">
                    Estimated from your {reposAnalysed} most active repos out of {totalRepos}.
                </p>
            )}
        </div>
    );
}
