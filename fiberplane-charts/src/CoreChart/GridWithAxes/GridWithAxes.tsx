import { animate, Tween, useMotionValue } from "framer-motion";
import { memo, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useTheme } from "styled-components";

import type { AbstractChart, Axis } from "../../Mondrian";
import { BottomAxis } from "./BottomAxis";
import { GridColumns } from "./GridColumns";
import { GridRows } from "./GridRows";
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
  const { xMax, yMax, yScale } = scales;

  const { colorBase300 } = useTheme();
  const strokeColor = gridStrokeColor || colorBase300;

  const { xAxis, yAxis } = chart;
  const minValue = useCustomSpring(yAxis.minValue);
  const maxValue = useCustomSpring(yAxis.maxValue);

  const animatedScale = yScale.copy().domain([minValue, maxValue]);

  const xTicks = useMemo(() => getTicks(xAxis, 12), [xAxis]);
  const yTicks = useMemo(() => getTicks(yAxis, 8), [yAxis]);

  return (
    <>
      {gridRowsShown && (
        <GridRows
          stroke={strokeColor}
          strokeDasharray={gridDashArray}
          xMax={xMax}
          yScale={animatedScale}
          yTicks={yTicks}
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
          dimensions={scales}
          stroke={strokeColor}
          strokeDasharray={gridDashArray}
          xAxis={xAxis}
          xTicks={xTicks}
        />
      )}
      <BottomAxis
        dimensions={scales}
        strokeColor={strokeColor}
        strokeDasharray={gridDashArray}
        ticks={xTicks}
        xAxis={xAxis}
      />
      <LeftAxis
        scales={{ ...scales, yScale: animatedScale }}
        strokeColor={strokeColor}
        strokeDasharray={gridDashArray}
        strokeWidth={gridBordersShown ? 1 : 0}
        ticks={yTicks}
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

function getTicks(axis: Axis, numTicks: number): Array<number> {
  const suggestions = axis.tickSuggestions;
  if (suggestions) {
    return getTicksFromSuggestions(suggestions, numTicks);
  }

  const { minValue, maxValue } = axis;
  const interval = (maxValue - minValue) / numTicks;

  const ticks = [minValue];
  let tick = minValue + interval;
  while (tick < maxValue) {
    ticks.push(tick);
    tick += interval;
  }

  return ticks;
}

function getTicksFromSuggestions(
  suggestions: Array<number>,
  numTicks: number,
): Array<number> {
  const len = suggestions.length;
  if (len <= numTicks) {
    return suggestions;
  }

  const ticks = [];
  const divisionFactor = Math.ceil(len / numTicks);
  for (let i = 0; i < len; i++) {
    if (i % divisionFactor === 0) {
      ticks.push(suggestions[i]);
    }
  }

  return ticks;
}
