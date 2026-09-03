import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const trimmed = username.trim();
        if (trimmed) navigate(`/${trimmed}`);
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 text-neutral-100">
            <h1 className="mb-2 text-4xl font-bold">Gitnalysis</h1>
            <p className="mb-8 text-neutral-400">Analyzing your GitHub activity</p>

            <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
                <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="GitHub username"
                    className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500"
                />
                <button
                    type="submit"
                    className="rounded-md bg-neutral-100 px-4 py-2 font-medium text-neutral-900 hover:bg-neutral-300"
                >
                    View
                </button>
            </form>
        </div>
    )
}
