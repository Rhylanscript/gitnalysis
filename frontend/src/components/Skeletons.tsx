export function StatCardSkeleton() {
    return (
        <div className="animate-pulse rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="h-7 w-12 rounded bg-neutral-800" />
            <div className="mt-2 h-3 w-20 rounded bg-neutral-800" />
        </div>
    );
}

export function ActivityGraphSkeleton() {
    return (
        <div className="animate-pulse rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-4 h-3 w-16 rounded bg-neutral-800" />
            <div className="h-50 w-full rounded bg-neutral-800/60" />
        </div>
    );
}

export function LanguageChartSkeleton() {
    return (
        <div className="animate-pulse rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-4 h-3 w-24 rounded bg-neutral-800" />
            <div className="mx-auto aspect-square w-full max-w-45 rounded-full bg-neutral-800/60" />
        </div>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="w-full animate-pulse space-y-4 lg:w-64 lg:shrink-0">
            <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-neutral-800" />
                <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-neutral-800" />
                    <div className="h-3 w-16 rounded bg-neutral-800" />
                </div>
            </div>
            <div className="h-24 rounded-lg border border-neutral-800 bg-neutral-900" />
        </div>
    );
}
