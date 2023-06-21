import { debounce } from "throttle-debounce";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChartSizeContext, ChartSizeContextValue } from "../context";
import { mergeRefs } from "../utils";
import { useIntersectionObserver, useMeasure } from "../hooks";

type Props = {
    children: React.ReactNode;
    className?: string;
    // By default the measured height will be used unless this value is specified
    // This is useful for charts that contain more than just the chart (but also a legend, for example)
    overrideHeight?: number;
    marginTop?: number;
    marginLeft?: number;
    marginRight?: number;
    marginBottom?: number;
};

export function ChartSizeContainerProvider({
    children,
    className,
    overrideHeight,
    marginTop = 0,
    marginRight = 0,
    marginBottom = 0,
    marginLeft = 0,
}: Props) {
    const [measureRef, { width, height: measuredHeight }] =
        useMeasure<HTMLDivElement>();
    const intersectionRef = useRef<HTMLDivElement>(null);
    const ref = mergeRefs([measureRef, intersectionRef]);

    const intersections = useIntersectionObserver(intersectionRef, {
        root: null,
        rootMargin: "0px",
        threshold: 0,
    });
    const [value, setValue] = useState<ChartSizeContextValue>({
        xMax: 0,
        yMax: 0,
        width: 0,
        height: 0,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
    });

    const height = overrideHeight ?? measuredHeight;
    const updateValue = useMemo(
        () =>
            debounce(100, (width: number, height: number) =>
                setValue({
                    xMax: width - marginLeft - marginRight,
                    yMax: height - marginTop - marginBottom,
                    width,
                    height,
                    marginTop,
                    marginRight,
                    marginBottom,
                    marginLeft,
                }),
            ),
        [marginTop, marginRight, marginBottom, marginLeft],
    );

    useEffect(() => {
        updateValue(width, height);
    }, [width, height]);

    return (
        <div ref={ref} className={className}>
            {value.width > 0 &&
            value.height > 0 &&
            intersections.some(
                (intersection) => intersection.isIntersecting,
            ) ? (
                <ChartSizeContext.Provider value={value}>
                    {children}
                </ChartSizeContext.Provider>
            ) : (
                <ChartSkeleton height={height} />
            )}
        </div>
    );
}

function ChartSkeleton({ height }: { height: number }) {
    return <div style={{ height }} />;
}
