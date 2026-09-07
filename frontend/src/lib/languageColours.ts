export const LANGUAGE_COLOURS: Record<string, string> = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    "C#": "#178600",
    PHP: "#4F5D95",
    Ruby: "#701516",
    Go: "#00ADD8",
    Rust: "#dea584",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Vue: "#41b883",
    Dart: "#00B4AB",
    Scala: "#c22d40",
    Lua: "#000080",
    PowerShell: "#012456",
}

const FALLBACK_COLOUR = "#8b8b8b";

export function getLanguageColour(name: string): string {
    return LANGUAGE_COLOURS[name] ?? FALLBACK_COLOUR;
}
