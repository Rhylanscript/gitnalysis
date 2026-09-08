import { PERIODS, type Period } from "../lib/api";

interface Props {
    value: Period;
    onChange: (period: Period) => void;
}

export default function PeriodSelector({ value, onChange }: Props) {
    return (
        <div className="flex gap-1 rounded-md bg-neutral-900 p-1">
            {PERIODS.map((p) => (
                <button
                    key={p.value}
                    onClick={() => onChange(p.value)}
                    className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                        value === p.value
                            ? "bg-emerald-400 text-neutral-950"
                            : "text-neutral-400 hover:text-neutral-100"
                    }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
}
