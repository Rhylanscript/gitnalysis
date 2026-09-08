import { useLayoutEffect, useRef, useState } from "react";

export function useSlidingIndicator(activeKey: string) {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Record<string, HTMLElement | null>>({});
    const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

    useLayoutEffect(() => {
        function measure() {
            const container = containerRef.current;
            const active = itemRefs.current[activeKey];
            if (!container || !active) return;

            const containerRect = container.getBoundingClientRect();
            const activeRect = active.getBoundingClientRect();

            setIndicator({
                left: activeRect.left - containerRect.left,
                width: activeRect.width,
            });
        }

        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [activeKey]);

    function register(key: string) {
        return (el: HTMLElement | null) => {
            itemRefs.current[key] = el;
        };
    }

    return { containerRef, indicator, register };
}
