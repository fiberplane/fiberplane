import { AxisLeft, TickFormatter, Orientation } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import type { NumberValue } from "d3-scale";
import { animate, Tween, useMotionValue } from "framer-motion";
import { memo, useEffect, useLayoutEffect, useState } from "react";
import { useTheme } from "styled-components";

import Bottom from "./Bottom";
import { ValueScale, XScaleTypes } from "../../MetricsChart/scales";

type Props = {
    xMax: number;
    yMax: number;
    xScale: XScaleTypes;
    yScale: ValueScale;
    xScaleFormatter?: TickFormatter<Date | NumberValue>;
    gridColumnsShown?: boolean;
    gridRowsShown?: boolean;
    gridBordersShown?: boolean;
    gridDashArray?: string;
};

export const GridWithAxes = memo(function GridWithAxes({
    xMax,
    yMax,
    xScale,
    yScale,
    xScaleFormatter,
    gridColumnsShown = true,
    gridRowsShown = true,
    gridBordersShown = true,
    gridDashArray,
}: Props) {
    const [targetLower = 0, targetUpper = 0] = yScale.domain();

    const { colorBase300 } = useTheme();
    const lower = useCustomSpring(targetLower);
    const upper = useCustomSpring(targetUpper);

    const temporaryScale = yScale.copy().domain([lower, upper]);
    const ticks = temporaryScale.ticks();
    const {
        colorBase500,
        fontAxisFontSize,
        fontAxisFontFamily,
        fontAxisFontStyle,
        fontAxisFontWeight,
        fontAxisLetterSpacing,
        fontAxisLineHeight,
    } = useTheme();

    const axisLeftTickLabelProps = {
        dx: "-0.25em",
        dy: "0.25em",
        textAnchor: "end" as const,
        fontFamily: fontAxisFontFamily,
        fontStyle: fontAxisFontStyle,
        fontWeight: fontAxisFontWeight,
        fontSize: fontAxisFontSize,
        letterSpacing: fontAxisLetterSpacing,
        lineHeight: fontAxisLineHeight,
        fill: colorBase500,
    };

    return (
        <>
            {gridRowsShown && (
                <GridRows
                    scale={temporaryScale}
                    width={xMax}
                    height={yMax}
                    stroke={colorBase300}
                    strokeDasharray={gridDashArray}
                />
            )}
            {gridBordersShown && (
                <line
                    x1={xMax}
                    x2={xMax}
                    y1={0}
                    y2={yMax}
                    stroke={colorBase300}
                    strokeWidth={1}
                    strokeDasharray={gridDashArray}
                />
            )}
            {gridColumnsShown && (
                <GridColumns
                    scale={xScale}
                    width={xMax}
                    height={yMax}
                    stroke={colorBase300}
                    strokeDasharray={gridDashArray}
                />
            )}
            <Bottom
                xMax={xMax}
                xScale={xScale}
                yMax={yMax}
                xScaleFormatter={xScaleFormatter}
                strokeDasharray={gridDashArray}
            />
            <AxisLeft
                scale={temporaryScale}
                orientation={Orientation.left}
                stroke={colorBase300}
                strokeWidth={gridBordersShown ? 1 : 0}
                strokeDasharray={gridDashArray}
                hideTicks={true}
                tickLabelProps={() => axisLeftTickLabelProps}
                tickFormat={temporaryScale.tickFormat(10, "~s")}
                tickValues={ticks.slice(1, -1)}
            />
        </>
    );
});

const spring: Tween = {
    type: "tween",
    duration: 1,
    easings: ["anticipate"],
};

function useCustomSpring(value: number) {
    const motionValue = useMotionValue(value);
    const [current, setCurrent] = useState(value);

    useLayoutEffect(() => {
        return motionValue.onChange((value) => setCurrent(value));
    }, [motionValue]);

    useEffect(() => {
        const controls = animate(motionValue, value, spring);
        return controls.stop;
    }, [motionValue, value]);

    return current;
}
