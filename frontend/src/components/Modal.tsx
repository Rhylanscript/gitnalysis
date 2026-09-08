import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface Props {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

const EXIT_DURATION = 180;

export default function Modal({ title, onClose, children }: Props) {
    const [closing, setClosing] = useState(false);

    function handleClose() {
        setClosing(true);
        setTimeout(onClose, EXIT_DURATION);
    }

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") handleClose();
        }
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return createPortal(
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
                closing ? "modal-backdrop-out" : "modal-backdrop-in"
            }`}
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={handleClose}
        >
            <div
                className={`flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/50 ${
                    closing ? "modal-panel-out" : "modal-panel-in"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 px-4 py-3">
                    <h2 className="text-sm font-medium text-neutral-200">{title}</h2>
                    <button
                        onClick={handleClose}
                        className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="custom-scrollbar overflow-y-auto p-4">{children}</div>
            </div>
        </div>,
        document.body,
    );
}
