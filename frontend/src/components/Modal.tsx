import { useEffect } from "react";
import { X } from "lucide-react";

interface Props {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: Props) {
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div
                className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 p-4">
                    <h2 className="text-sm font-medium text-neutral-300">{title}</h2>
                    <button onClick={onClose} className="text-neutral-500 hover:text-neutral-100">
                        <X size={18} />
                    </button>
                </div>
                <div className="custom-scrollbar overflow-y-auto p-4">{children}</div>
            </div>
        </div>
    );
}
