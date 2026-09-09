import { Award, BicepsFlexed, BookMarked, Bug, CalendarCheck, CircleQuestionMark, Compass, Eye, Flame, GitBranch, GitCommitHorizontal, GitPullRequest, Languages, Trophy, Zap, type LucideIcon } from "lucide-react";

export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
    multilingual: Languages,
    polyglot: Languages,
    hyperpolyglot: Languages,

    ignition: Flame,
    committed: Flame,
    marathon: Flame,
    juggernaut: Flame,
    green_wall: Flame, // BrickWallFire,

    explorer: Compass,
    wanderer: Compass,
    cartographer: Compass,

    open_source: GitBranch,
    citizen_of_the_web: GitBranch,
    ambassador: GitBranch,

    lgtm: Eye,
    reviewer: Eye,
    code_auditor: Eye,
    overseer: Eye,

    century: GitCommitHorizontal,
    grinder: GitCommitHorizontal,
    machine: GitCommitHorizontal,
    tenxdev: GitCommitHorizontal,

    packer: GitPullRequest,
    shipper: GitPullRequest,
    works_on_my_machine: GitPullRequest,
    rubber_ducker: GitPullRequest,

    nitpicker: Bug,
    detective: Bug,
    bug_hunter: Bug,
    pest_control: Bug,

    sprint: Zap,
    iron_week: Zap,

    steady: CalendarCheck,
    focus: CalendarCheck,
    ai_in_disguise: CalendarCheck,
    scripter: CalendarCheck,

    founder: BookMarked,
    tycoon: BookMarked,

    over_9000: BicepsFlexed,
    completionist: Trophy,
    true_completionist: Trophy,
};

export const FALLBACK_ACHIEVEMENT_ICON: LucideIcon = Award;
export const SECRET_LOCKED_ICON: LucideIcon = CircleQuestionMark;
