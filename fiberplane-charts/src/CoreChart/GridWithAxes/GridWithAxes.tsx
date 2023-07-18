import { GridRows, GridColumns } from "@visx/grid";
import { animate, Tween, useMotionValue } from "framer-motion";
import { memo, useEffect, useLayoutEffect, useState } from "react";
import { useTheme } from "styled-components";

import type { AbstractChart } from "../../Mondrian";
import { BottomAxis } from "./BottomAxis";
import { LeftAxis } from "./LeftAxis";
import type { Scales } from "../types";

type Props = {
  chart: AbstractChart<unknown, unknown>;
  gridColumnsShown?: boolean;
  gridRowsShown?: boolean;
  gridBordersShown?: boolean;
  gridDashArray?: string;
  gridStrokeColor?: string;
  scales: Scales;
};

export const GridWithAxes = memo(function GridWithAxes({
  chart,
  gridColumnsShown = true,
  gridRowsShown = true,
  gridBordersShown = true,
  gridDashArray,
  gridStrokeColor,
  scales,
}: Props) {
  const { xMax, xScale, yMax, yScale } = scales;

  const { colorBase300 } = useTheme();
  const strokeColor = gridStrokeColor || colorBase300;

  const minValue = useCustomSpring(chart.yAxis.minValue);
  const maxValue = useCustomSpring(chart.yAxis.maxValue);

  const animatedScale = yScale.copy().domain([minValue, maxValue]);

  return (
    <>
      {gridRowsShown && (
        <GridRows
          scale={animatedScale}
          width={xMax}
          height={yMax}
          stroke={strokeColor}
          strokeDasharray={gridDashArray}
        />
      )}
      {gridBordersShown && (
        <line
          x1={xMax}
          x2={xMax}
          y1={0}
          y2={yMax}
          stroke={strokeColor}
          strokeWidth={1}
          strokeDasharray={gridDashArray}
        />
      )}
      {gridColumnsShown && (
        <GridColumns
          scale={xScale}
          width={xMax}
          height={yMax}
          stroke={strokeColor}
          strokeDasharray={gridDashArray}
        />
      )}
      <BottomAxis
        numTicks={10}
        scales={scales}
        strokeColor={strokeColor}
        strokeDasharray={gridDashArray}
        xAxis={chart.xAxis}
      />
      <LeftAxis
        numTicks={6}
        scales={{ ...scales, yScale: animatedScale }}
        strokeColor={strokeColor}
        strokeDasharray={gridDashArray}
        strokeWidth={gridBordersShown ? 1 : 0}
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
    return motionValue.on("change", (value) => setCurrent(value));
  }, [motionValue]);

  useEffect(() => {
    const controls = animate(motionValue, value, spring);
    return controls.stop;
  }, [motionValue, value]);

  return current;
}
