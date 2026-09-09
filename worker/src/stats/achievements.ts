export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    secret: boolean;
}

export interface AchievementInput {
    languageCount: number;
    longestStreak: number;
    repoCount: number;
    contributedNotOwnedCount: number;

    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    totalReviews: number;

    mostCommitsInADay: number;
    mostCommitsInAWeek: number;

    activeDays: { active: number; total: number };

    reposCreated: number;

    weekendContributions: number;
    weekdayContributions: number;
    totalContributions: number;
    mostActiveRepoCommits: number;
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
    green_wall: 100,            // secret

    // committing to diff repos
    explorer: 5,
    wanderer: 10,
    cartographer: 20,

    // (non owned repos)
    // open_source: 1
    citizen_of_the_web: 3,
    ambassador: 10,
    
    // code review
    // lgtm: 1
    reviewer: 10,
    code_auditor: 50,
    overseer: 100,

    // commit count
    century: 100,
    grinder: 500,
    machine: 1000,
    tenxdev: 2000,

    // PRs
    packer: 10,
    shipper: 30,
    works_on_my_machine: 50,
    rubber_ducker: 200,

    // issues
    nitpicker: 5,
    detective: 10,
    bug_hunter: 30,
    pest_control: 100,

    // single day/week
    sprint: 20,

    iron_week: 150,

    // consistency (ratio of active days)
    steady: 0.8,
    focus: 0.9,
    ai_in_disguise: 0.95,
    scripter: 1.0,                  // secret

    // repos created
    founder: 3,
    tycoon: 20,

    // day of week stuff
    weekend_warrior: 0.75,           // secret

    // balance
    well_rounded_max_share: 0.9,    // secret
    well_rounded_min_share: 0.1,

    // misc / secret

    one_repo_wonder_ratio: 0.8,
    one_repo_wonder_min_commits: 50,

    over_9000: 9000,            // secret
    // answer_to_everything: 42,   // secret
};

export function calculateAchievements(input: AchievementInput): Achievement[] {
    const activeRatio = input.activeDays.total > 0 ? input.activeDays.active / input.activeDays.total : 0;

    const base: Achievement[] = [
        // freebie
        {
            id: "hello_world",
            name: "Hello, World",
            description: `Made your first commit`,
            unlocked: input.totalCommits >= 1,
            secret: false,
        },

        // lang variety
        {
            id: "multilingual",
            name: "Multilingual",
            description: `Used ${THRESHOLDS.multilingual}+ languages`,
            unlocked: input.languageCount >= THRESHOLDS.multilingual,
            secret: false,
        },
        {
            id: "polyglot",
            name: "Polyglot",
            description: `Used ${THRESHOLDS.polyglot}+ languages`,
            unlocked: input.languageCount >= THRESHOLDS.polyglot,
            secret: false,
        },
        {
            id: "hyperpolyglot",
            name: "Hyperpolyglot",
            description: `Used ${THRESHOLDS.hyperpolyglot}+ languages`,
            unlocked: input.languageCount >= THRESHOLDS.hyperpolyglot,
            secret: false,
        },

        // contribution streak
        {
            id: "ignition",
            name: "Ignition",
            description: `Maintained a ${THRESHOLDS.ignition}+ day contribution streak`,
            unlocked: input.longestStreak >= THRESHOLDS.ignition,
            secret: false,
        },
        {
            id: "committed",
            name: "Committed",
            description: `Maintained a ${THRESHOLDS.committed}+ day contribution streak`,
            unlocked: input.longestStreak >= THRESHOLDS.committed,
            secret: false,
        },
        {
            id: "marathon",
            name: "Marathon",
            description: `Maintained a ${THRESHOLDS.marathon}+ day contribution streak`,
            unlocked: input.longestStreak >= THRESHOLDS.marathon,
            secret: false,
        },
        {
            id: "juggernaut",
            name: "Juggernaut",
            description: `Maintained a ${THRESHOLDS.juggernaut}+ day contribution streak`,
            unlocked: input.longestStreak >= THRESHOLDS.juggernaut,
            secret: false,
        },
        {
            id: "green_wall",
            name: "Green Wall",
            description: `Maintained a ${THRESHOLDS.green_wall}+ day contribution streak`,
            unlocked: input.longestStreak >= THRESHOLDS.green_wall,
            secret: true,
        },

        // contribution to diff repos
        {
            id: "explorer",
            name: "Explorer",
            description: `Contributed to ${THRESHOLDS.explorer}+ repositories`,
            unlocked: input.repoCount >= THRESHOLDS.explorer,
            secret: false,
        },
        {
            id: "wanderer",
            name: "Wanderer",
            description: `Contributed to ${THRESHOLDS.wanderer}+ repositories`,
            unlocked: input.repoCount >= THRESHOLDS.wanderer,
            secret: false,
        },
        {
            id: "cartographer",
            name: "Cartographer",
            description: `Contributed to ${THRESHOLDS.cartographer}+ repositories`,
            unlocked: input.repoCount >= THRESHOLDS.cartographer,
            secret: false,
        },

        // contribution to non owned repos
        {
            id: "open_source",
            name: "Open Source",
            description: `Contributed to a repository you don't own`,
            unlocked: input.contributedNotOwnedCount >= 1,
            secret: false,
        },
        {
            id: "citizen_of_the_web",
            name: "Citizen of the Web",
            description: `Contributed to ${THRESHOLDS.citizen_of_the_web}+ repositories you don't own`,
            unlocked: input.contributedNotOwnedCount >= THRESHOLDS.citizen_of_the_web,
            secret: false,
        },
        {
            id: "ambassador",
            name: "Ambassador",
            description: `Contributed to ${THRESHOLDS.ambassador}+ repositories you don't own`,
            unlocked: input.contributedNotOwnedCount >= THRESHOLDS.ambassador,
            secret: false,
        },

        // code review
        {
            id: "lgtm",
            name: "LGTM",
            description: `Completed a code review`,
            unlocked: input.totalReviews >= 1,
            secret: false,
        },
        {
            id: "reviewer",
            name: "Reviewer",
            description: `Completed ${THRESHOLDS.reviewer}+ code reviews`,
            unlocked: input.totalReviews >= THRESHOLDS.reviewer,
            secret: false,
        },
        {
            id: "code_auditor",
            name: "Code Auditor",
            description: `Completed ${THRESHOLDS.code_auditor}+ code reviews`,
            unlocked: input.totalReviews >= THRESHOLDS.code_auditor,
            secret: false,
        },
        {
            id: "overseer",
            name: "Overseer",
            description: `Completed ${THRESHOLDS.overseer}+ code reviews`,
            unlocked: input.totalReviews >= THRESHOLDS.overseer,
            secret: false,
        },

        // commits
        {
            id: "century",
            name: "Century",
            description: `Made ${THRESHOLDS.century}+ commits`,
            unlocked: input.totalCommits >= THRESHOLDS.century,
            secret: false,
        },
        {
            id: "grinder",
            name: "Grinder",
            description: `Made ${THRESHOLDS.grinder}+ commits`,
            unlocked: input.totalCommits >= THRESHOLDS.grinder,
            secret: false,
        },
        {
            id: "machine",
            name: "Machine",
            description: `Made ${THRESHOLDS.machine}+ commits`,
            unlocked: input.totalCommits >= THRESHOLDS.machine,
            secret: false,
        },
        {
            id: "tenxdev",
            name: "10x Dev",
            description: `Made ${THRESHOLDS.tenxdev}+ commits`,
            unlocked: input.totalCommits >= THRESHOLDS.tenxdev,
            secret: false,
        },

        // PRs
        {
            id: "packer",
            name: "Packer",
            description: `Opened ${THRESHOLDS.packer}+ Pull Requests`,
            unlocked: input.totalPRs >= THRESHOLDS.packer,
            secret: false,
        },
        {
            id: "shipper",
            name: "Shipper",
            description: `Opened ${THRESHOLDS.shipper}+ Pull Requests`,
            unlocked: input.totalPRs >= THRESHOLDS.shipper,
            secret: false,
        },
        {
            id: "works_on_my_machine",
            name: "Works on my Machine",
            description: `Opened ${THRESHOLDS.works_on_my_machine}+ Pull Requests`,
            unlocked: input.totalPRs >= THRESHOLDS.works_on_my_machine,
            secret: false,
        },
        {
            id: "rubber_ducker",
            name: "Rubber Ducker",
            description: `Opened ${THRESHOLDS.rubber_ducker}+ Pull Requests`,
            unlocked: input.totalPRs >= THRESHOLDS.rubber_ducker,
            secret: false,
        },
        
        // issues
        {
            id: "nitpicker",
            name: "Nitpicker",
            description: `Opened ${THRESHOLDS.nitpicker}+ issues`,
            unlocked: input.totalIssues >= THRESHOLDS.nitpicker,
            secret: false,
        },
        {
            id: "detective",
            name: "Detective",
            description: `Opened ${THRESHOLDS.detective}+ issues`,
            unlocked: input.totalIssues >= THRESHOLDS.detective,
            secret: false,
        },
        {
            id: "bug_hunter",
            name: "Bug Hunter",
            description: `Opened ${THRESHOLDS.bug_hunter}+ issues`,
            unlocked: input.totalIssues >= THRESHOLDS.bug_hunter,
            secret: false,
        },
        {
            id: "pest_control",
            name: "Pest Control",
            description: `Opened ${THRESHOLDS.pest_control}+ issues`,
            unlocked: input.totalIssues >= THRESHOLDS.pest_control,
            secret: false,
        },

        // bursts
        {
            id: "sprint",
            name: "Sprint",
            description: `Made ${THRESHOLDS.sprint}+ commits in a single day`,
            unlocked: input.mostCommitsInADay >= THRESHOLDS.sprint,
            secret: false,
        },
        {
            id: "iron_week",
            name: "Iron Week",
            description: `Made ${THRESHOLDS.iron_week}+ commits in a single week`,
            unlocked: input.mostCommitsInAWeek >= THRESHOLDS.iron_week,
            secret: false,
        },

        // consistency
        {
            id: "steady",
            name: "Steady",
            description: `Active on ${Math.round(THRESHOLDS.steady * 100)}%+ of days this year`,
            unlocked: activeRatio >= THRESHOLDS.steady,
            secret: false,
        },
        {
            id: "focus",
            name: "Focus",
            description: `Active on ${Math.round(THRESHOLDS.focus * 100)}%+ of days this year`,
            unlocked: activeRatio >= THRESHOLDS.focus,
            secret: false,
        },
        {
            id: "ai_in_disguise",
            name: "AI in Disguise",
            description: `Active on ${Math.round(THRESHOLDS.ai_in_disguise * 100)}%+ of days this year`,
            unlocked: activeRatio >= THRESHOLDS.ai_in_disguise,
            secret: false,
        },
        {
            id: "scripter",
            name: "Scripter",
            description: `Active on ${Math.round(THRESHOLDS.scripter * 100)}%+ of days this year`,
            unlocked: activeRatio >= THRESHOLDS.scripter,
            secret: true,
        },

        // repos created
        {
            id: "founder",
            name: "Founder",
            description: `Created ${THRESHOLDS.founder}+ repositories`,
            unlocked: input.reposCreated >= THRESHOLDS.founder,
            secret: false,
        },
        {
            id: "tycoon",
            name: "Tycoon",
            description: `Created ${THRESHOLDS.tycoon}+ repositories`,
            unlocked: input.reposCreated >= THRESHOLDS.tycoon,
            secret: false,
        },

        // day of week pattern
        {
            id: "weekend_warrior",
            name: "Weekend Warrior",
            description: `${Math.round(THRESHOLDS.weekend_warrior * 100)}%+ of contributions made on weekends`,
            unlocked:
                input.totalContributions > 0 &&
                input.weekendContributions / input.totalContributions >= THRESHOLDS.weekend_warrior,
            secret: true,
        },
        {
            id: "well_rounded",
            name: "Well Rounded",
            description: `A well rounded mix of commits, PRs, issues, and reviews`,
            unlocked: (() => {
                const counts = [input.totalCommits, input.totalPRs, input.totalIssues, input.totalReviews];
                const total = input.totalCommits + input.totalPRs + input.totalIssues + input.totalReviews;
                if (total <= 0) return false;
                return counts.every((count) => {
                    const share = count / total;
                    return (
                        share >= THRESHOLDS.well_rounded_min_share &&
                        share <= THRESHOLDS.well_rounded_max_share
                    );
                });
            })(),
            secret: true,
        },
        {
            id: "one_repo_wonder",
            name: "One Repo Wonder",
            description: `Nearly all your commits went to a single repository`,
            unlocked:
                input.totalCommits >= THRESHOLDS.one_repo_wonder_min_commits &&
                input.mostActiveRepoCommits / input.totalCommits >= THRESHOLDS.one_repo_wonder_ratio,
            secret: true,
        },
        {
            id: "backseat_driver",
            name: "Backseat Driver",
            description: `Reviewed more code than you committed`,
            unlocked: input.totalReviews > input.totalCommits && input.totalReviews > 0,
            secret: true,
        },

        // misc / secrets
        // {
        //     id: "answer_to_everything",
        //     name: "The Answer",
        //     description: `Made exactly ${THRESHOLDS.answer_to_everything} commits`,
        //     unlocked: input.totalCommits === THRESHOLDS.answer_to_everything,
        //     secret: true,
        // },
        {
            id: "over_9000",
            name: "Over 9000",
            description: `Made ${THRESHOLDS.over_9000}+ contributions in a year`,
            unlocked: input.totalContributions > THRESHOLDS.over_9000,
            secret: true,
        },
    ];

    // completionists

    const completionist: Achievement = {
        id: "completionist",
        name: "Completionist",
        description: `Unlocked all achievements (except secrets)`,
        unlocked: base.every((a) => {
            return a.secret || a.unlocked;
        }),
        secret: false,
    };

    const true_completionist: Achievement = {
        id: "true_completionist",
        name: "True Completionist",
        description: `Unlocked all achievements`,
        unlocked: base.every((a) => a.unlocked),
        secret: true,
    };

    return [...base, completionist, true_completionist];
}
