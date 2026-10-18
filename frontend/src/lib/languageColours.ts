export const LANGUAGE_COLOURS: Record<string, string> = {
    Assembly: "#6e4c13",

    Batchfile: "#c1f22e",
    
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    CMake: "#d93434",
    CoffeeScript: "#244775",
    CSS: "#563d7c",
    
    Dart: "#00B4AB",
    Dockerfile: "#384d54",
    
    GDScript: "#355570",
    Go: "#00ADD8",
    
    HTML: "#e34c26",
    
    Java: "#b07219",
    JavaScript: "#f1e05a",
    
    Kotlin: "#A97BFF",
    
    Lua: "#000080",
    
    Makefile: "#427819",
    MDX: "#fcb32b",
    
    Perl: "#0298c2",
    PHP: "#4F5D95",
    PowerShell: "#012456",
    Python: "#3572A5",
    
    Ruby: "#701516",
    Rust: "#dea584",
    
    Scala: "#c22d40",
    Shell: "#89e051",
    Swift: "#F05138",
    
    TypeScript: "#3178c6",
    
    Vue: "#41b883",
    
    WSGL: "#1a5e99",
}

const FALLBACK_COLOUR = "#8b8b8b";

export function getLanguageColour(name: string): string {
    return LANGUAGE_COLOURS[name] ?? FALLBACK_COLOUR;
}
