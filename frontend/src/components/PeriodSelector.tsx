import { PERIODS, type Period } from "../lib/api";
import { useSlidingIndicator } from "../hooks/useSlidingIndicator";

interface Props {
    value: Period;
    onChange: (period: Period) => void;
}

export default function PeriodSelector({ value, onChange }: Props) {
    const { containerRef, indicator, register } = useSlidingIndicator(value);

    return (
        <div ref={containerRef} className="relative flex gap-1 rounded-md bg-neutral-900 p-1">
            {indicator && (
                <div
                    className="absolute inset-y-1 rounded bg-emerald-400 transition-all duration-220 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ left: indicator.left, width: indicator.width }}
                />
            )}
            {PERIODS.map((p) => (
                <button
                    key={p.value}
                    ref={register(p.value)}
                    onClick={() => onChange(p.value)}
                    className={`relative z-10 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                        value === p.value ? "text-neutral-950" : "text-neutral-400 hover:text-neutral-100"
                    }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
}