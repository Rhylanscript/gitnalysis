export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
}

export interface AchievementInput {
    languageCount: number;
    longestStreak: number;
    repoCount: number;
    contributedNotOwnedCount: number;
    reviewCount: number;
}

const THRESHOLDS = {
    // languages used
    multilingual: 5,
    polyglot: 10,
    hyperpolyglot: 15,
    
    // contribution streaks
    ignition: 5,
    committed: 10,
    marathon: 30,
    juggernaut: 50,
    green_wall: 100,

    // committing to diff repos
    explorer: 5,

    // open source (non owned repos)
    citizen_of_the_web: 3,
    
    // code review
    reviewer: 10,
    code_auditor: 20,
};

export function calculateAchievements(input: AchievementInput): Achievement[] {
    return [
        // lang variety
        {
            id: "multilingual",
            name: "Multilingual",
            description: `Used ${THRESHOLDS.multilingual}+ languages`,
            unlocked: input.languageCount >= THRESHOLDS.multilingual,
        },
        {
            id: "polyglot",
            name: "Polyglot",
            description: `Used ${THRESHOLDS.polyglot}+ languages`,
            unlocked: input.languageCount >= THRESHOLDS.polyglot,
        },
        {
            id: "hyperpolyglot",
            name: "Hyperpolyglot",
            description: `Used ${THRESHOLDS.hyperpolyglot}+ languages`,
            unlocked: input.languageCount >= THRESHOLDS.hyperpolyglot,
        },

        // contribution streak
        {
            id: "ignition",
            name: "Ignition",
            description: `Maintained a ${THRESHOLDS.ignition}+ day contribution streak`,
            unlocked: input.longestStreak >= THRESHOLDS.ignition,
        },
        {
            id: "committed",
            name: "Committed",
            description: `Maintained a ${THRESHOLDS.committed}+ day contribution streak`,
            unlocked: input.longestStreak >= THRESHOLDS.committed,
        },
        {
            id: "marathon",
            name: "Marathon",
            description: `Maintained a ${THRESHOLDS.marathon}+ day contribution streak`,
            unlocked: input.longestStreak >= THRESHOLDS.marathon,
        },
        {
            id: "juggernaught",
            name: "Juggernaught",
            description: `Maintained a ${THRESHOLDS.juggernaut}+ day contribution streak`,
            unlocked: input.longestStreak >= THRESHOLDS.juggernaut,
        },
        {
            id: "green_wall",
            name: "Green Wall",
            description: `Maintained a ${THRESHOLDS.green_wall}+ day contribution streak`,
            unlocked: input.longestStreak >= THRESHOLDS.green_wall,
        },

        // contribution to diff repos
        {
            id: "explorer",
            name: "Explorer",
            description: `Contributed to ${THRESHOLDS.explorer}+ repositories`,
            unlocked: input.repoCount >= THRESHOLDS.explorer,
        },

        // contribution to non owned repos
        {
            id: "open_source",
            name: "Open Source",
            description: `Contributed to a repository you don't own`,
            unlocked: input.contributedNotOwnedCount >= 1,
        },
        {
            id: "citizen_of_the_web",
            name: "Citizen of the Web",
            description: `Contributed to ${THRESHOLDS.citizen_of_the_web}+ repositories you don't own`,
            unlocked: input.contributedNotOwnedCount >= THRESHOLDS.citizen_of_the_web,
        },

        // code review
        {
            id: "lgtm",
            name: "LGTM",
            description: `Completed a code review`,
            unlocked: input.reviewCount >= 1,
        },
        {
            id: "reviewer",
            name: "Reviewer",
            description: `Completed ${THRESHOLDS.reviewer}+ code reviews`,
            unlocked: input.reviewCount >= THRESHOLDS.reviewer,
        },
        {
            id: "code_auditor",
            name: "Code Auditor",
            description: `Completed ${THRESHOLDS.code_auditor}+ code reviews`,
            unlocked: input.reviewCount >= THRESHOLDS.code_auditor,
        },
    ];
}
