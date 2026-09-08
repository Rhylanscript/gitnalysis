import { ACHIEVEMENT_ICONS, FALLBACK_ACHIEVEMENT_ICON } from "../lib/achievementIcons";

interface AchievementIconProps {
    id: string;
    size?: number;
}

function AchievementIcon({ id, size = 16 }: AchievementIconProps) {
    const Icon = ACHIEVEMENT_ICONS[id] ?? FALLBACK_ACHIEVEMENT_ICON;
    return <Icon size={size} />
}

interface Props {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
}

export default function AchievementBadge({ id, name, description, unlocked }: Props) {
    return (
        <div
            className={`flex items-start gap-3 rounded-md p-2 ${unlocked ? "" : "opacity-40"}`}
            title={description}
        >
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    unlocked
                        ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_12px_-3px_rgba(52,211,153,0.5)]"
                        : "bg-neutral-800 text-neutral-500"
                }`}
            >
                <AchievementIcon id={id} size={16} />
            </div>
            <div>
                <div className="text-sm font-medium text-neutral-100">{name}</div>
                <div className="text-xs text-neutral-500">{description}</div>
            </div>
        </div>
    );
}
