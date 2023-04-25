import { useLayoutEffect, useMemo, useState } from "react";

type Dimensions = { width: number; height: number };

const defaultDimensions: Dimensions = {
    width: 0,
    height: 0,
};

export function useMeasure<T extends HTMLElement>(): [
    React.RefCallback<T>,
    Dimensions,
] {
    const [element, setElement] = useState<T | null>(null);
    const [rect, setRect] = useState(defaultDimensions);

    const observer = useMemo(
        () =>
            new window.ResizeObserver((entries) => {
                const entry = entries[0];
                if (entry) {
                    const { width, height } = entry.contentRect;
                    setRect({ width, height });
                }
            }),
        [],
    );

    useLayoutEffect(() => {
        if (!element) {
            return;
        }

        observer.observe(element);
        return () => {
            observer.disconnect();
        };
    }, [element]);

    return [setElement, rect];
}
