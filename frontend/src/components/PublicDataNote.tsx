interface Props {
    restrictedCount: number;
}

export default function PublicDataNote({ restrictedCount }: Props) {
    return (
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-neutral-500 my-2">
            <svg
                className="h-3 w-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
                Public activity only
                {restrictedCount > 0 && ` · ${restrictedCount} private contribution${restrictedCount === 1 ? "" : "s"} not shown`}
            </span>
        </div>
    );
}
