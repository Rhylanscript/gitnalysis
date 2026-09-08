import { useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

interface Square {
    x: number;
    y: number;
    size: number;
    tier: 0 | 1 | 2 | 3;
    pulse?: boolean;
}

// sqares array - courtesy of chatgpt
const SQUARES: Square[] = [
    { x: 8, y: 12, size: 16, tier: 1 },
    { x: 22, y: 6, size: 10, tier: 0 },
    { x: 34, y: 18, size: 20, tier: 3, pulse: true },
    { x: 15, y: 30, size: 12, tier: 2 },
    { x: 44, y: 8, size: 14, tier: 1 },
    { x: 52, y: 24, size: 10, tier: 0 },
    { x: 30, y: 40, size: 18, tier: 2, pulse: true },
    { x: 60, y: 14, size: 12, tier: 3 },
    { x: 6, y: 46, size: 10, tier: 0 },
    { x: 70, y: 30, size: 16, tier: 1, pulse: true },
    { x: 46, y: 48, size: 12, tier: 2 },
    { x: 18, y: 58, size: 14, tier: 3 },
    { x: 62, y: 46, size: 10, tier: 0 },
    { x: 80, y: 18, size: 12, tier: 2 },
    { x: 36, y: 62, size: 20, tier: 1 },
    { x: 76, y: 50, size: 14, tier: 3, pulse: true },
    { x: 54, y: 66, size: 10, tier: 0 },
    { x: 10, y: 72, size: 12, tier: 1 },
    { x: 88, y: 36, size: 10, tier: 2 },
    { x: 66, y: 70, size: 16, tier: 2 },
    { x: 28, y: 80, size: 10, tier: 0 },
    { x: 44, y: 78, size: 14, tier: 3 },
    { x: 82, y: 62, size: 12, tier: 1, pulse: true },
    { x: 92, y: 74, size: 10, tier: 0 },
];

const TIER_CLASSES = [
    "bg-emerald-900/50",
    "bg-emerald-700/60",
    "bg-emerald-500/70",
    "bg-emerald-400/90",
];

const EXAMPLES = ["torvalds", "gaearon", "rhylanscript"];

export default function Landing() {
    const [username, setUsername] = useState("");
    const [focused, setFocused] = useState(false);
    const navigate = useNavigate();

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const trimmed = username.trim();
        if (trimmed) navigate(`/${trimmed}`);
    }

    return (
        <div className="gtn-landing relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-100">
            <div className="square-field pointer-events-none absolute inset-0 opacity-[0.1] lg:inset-auto lg:right-[6%] lg:top-1/2 lg:h-88 lg:w-88 lg:-translate-y-1/2 lg:opacity-100">
                {SQUARES.map((sq, i) => (
                    <div
                        key={i}
                        className={`square ${TIER_CLASSES[sq.tier]} ${sq.pulse ? "pulse" : ""}`}
                        style={
                            {
                                left: `${sq.x}%`,
                                top: `${sq.y}%`,
                                width: sq.size,
                                height: sq.size,
                                "--delay": `${i * 0.045}s`,
                                "--pulse-delay": `${(i % 6) * 0.5}s`,
                            } as CSSProperties
                        }
                    />
                ))}
            </div>

            <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 lg:max-w-xl lg:pl-24">
                <h1 className="fade-up text-5xl font-bold tracking-tight">Gitnalysis</h1>
                <p className="fade-up mt-3 text-neutral-400" style={{ animationDelay: "0.1s" }}>
                    An insight into your GitHub activity
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="fade-up mt-10 flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-4 py-3 font-mono text-sm transition-colors focus-within:border-emerald-500/50"
                    style={{ animationDelay: "0.2s" }}
                >
                    <span className="text-neutral-500">$ gitnalysis</span>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="username"
                        aria-label="GitHub username"
                        className="flex-1 bg-transparent text-neutral-100 placeholder-neutral-600 outline-none"
                    />
                    {!username && !focused && (
                        <span className="cursor -ml-2 h-4 w-2 bg-emerald-400" aria-hidden="true" />
                    )}
                    <button
                        type="submit"
                        className="rounded bg-emerald-400 px-3 py-1.5 font-sans text-sm font-medium text-neutral-950 transition-colors hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 cursor-pointer"
                    >
                        View
                    </button>
                </form>

                <div className="fade-up mt-4 flex items-center gap-2 text-sm text-neutral-500" style={{ animationDelay: "0.3s" }}>
                    <span>try</span>
                    {EXAMPLES.map((name) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => setUsername(name)}
                            className="font-mono text-neutral-400 underline decoration-neutral-700 underline-offset-4 hover:text-emerald-400 hover:decoration-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 rounded cursor-pointer"
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
