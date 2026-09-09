import { ACHIEVEMENT_ICONS, FALLBACK_ACHIEVEMENT_ICON, SECRET_LOCKED_ICON } from "../lib/achievementIcons";

interface AchievementIconProps {
    id: string;
    size?: number;
    isMystery: boolean;
}

function AchievementIcon({ id, size = 16, isMystery }: AchievementIconProps) {
    const Icon = isMystery ? SECRET_LOCKED_ICON : (ACHIEVEMENT_ICONS[id] ?? FALLBACK_ACHIEVEMENT_ICON);
    return <Icon size={size} />
}

interface Props {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    secret: boolean;
}

export default function AchievementBadge({ id, name, description, unlocked, secret }: Props) {
    const isMystery = secret && !unlocked;
    const displayName = isMystery ? "???" : name;
    const displayDescription = isMystery ? "Secret Achievement" : description;

    return (
        <div
            className={`flex items-start gap-3 rounded-md p-2 ${unlocked ? "" : "opacity-40"}`}
            // title={isMystery ? "Keep exploring to find out" : description}
        >
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    unlocked
                        ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_12px_-3px_rgba(52,211,153,0.5)]"
                        : "bg-neutral-800 text-neutral-500"
                }`}
            >
                <AchievementIcon id={id} size={16} isMystery={isMystery} />
            </div>
            <div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-100">
                    {displayName}
                    {secret && unlocked && (
                        <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                            Secret
                        </span>
                    )}
                </div>
                <div className="text-xs text-neutral-500">{displayDescription}</div>
            </div>
        </div>
    );
}
