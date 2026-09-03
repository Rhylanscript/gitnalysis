interface Props {
    label: string;
    value: number | string;
}

export default function StatCard({ label, value }: Props) {
    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="text-2xl font-bold text-neutral-100">{value}</div>
            <div className="text-sm text-neutral-400">{label}</div>
        </div>
    );
}
