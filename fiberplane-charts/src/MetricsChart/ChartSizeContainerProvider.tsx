import { debounce } from "throttle-debounce";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChartSizeContext, ChartSizeContextValue } from "../context";
import { HEIGHT, MARGINS } from "../constants";
import { mergeRefs } from "../utils";
import { useIntersectionObserver, useMeasure } from "../hooks";

const yMax = HEIGHT - MARGINS.top - MARGINS.bottom;

type Props = {
    children: React.ReactNode;
    className?: string;
};

export function ChartSizeContainerProvider({ children, className }: Props) {
    const [measureRef, { width, height }] = useMeasure<HTMLDivElement>();
    const intersectionRef = useRef<HTMLDivElement>(null);
    const ref = mergeRefs([measureRef, intersectionRef]);

    const intersections = useIntersectionObserver(intersectionRef, {
        root: null,
        rootMargin: "0px",
        threshold: 0,
    });
    const [value, setValue] = useState<ChartSizeContextValue>(getValue(width));
    const heightRef = useRef(height || 700);

    const updateValue = useMemo(
        () => debounce(100, (newWidth: number) => setValue(getValue(newWidth))),
        [],
    );

    useEffect(() => {
        updateValue(width);
    }, [width, updateValue]);

    if (height) {
        heightRef.current = height;
    }

    return (
        <div ref={ref} className={className}>
            {intersections.some(
                (intersection) => intersection.isIntersecting,
            ) ? (
                <ChartSizeContext.Provider value={value}>
                    {children}
                </ChartSizeContext.Provider>
            ) : (
                <ChartSkeleton height={heightRef.current} />
            )}
        </div>
    );
}

function ChartSkeleton({ height }: { height: number }) {
    return <div style={{ height }} />;
}

function getXMax(width: number) {
    return width - MARGINS.left - MARGINS.right;
}

function getValue(width: number = 0): ChartSizeContextValue {
    return {
        width,
        height: HEIGHT,
        xMax: Math.max(0, getXMax(width)),
        yMax,
    };
}
