import { Award, Compass, Eye, Flame, GitBranch, Languages, type LucideIcon } from "lucide-react";

export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
    multilingual: Languages,
    polyglot: Languages,
    hyperpolyglot: Languages,

    ignition: Flame,
    committed: Flame,
    marathon: Flame,
    juggernaut: Flame,
    green_wall: Flame,

    explorer: Compass,

    open_source: GitBranch,
    citizen_of_the_web: GitBranch,

    lgtm: Eye,
    reviewer: Eye,
    code_auditor: Eye,
};

export const FALLBACK_ACHIEVEMENT_ICON: LucideIcon = Award;
