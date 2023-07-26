import { animate, Tween, useMotionValue } from "framer-motion";
import { memo, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useTheme } from "styled-components";

import type { AbstractChart, Axis } from "../../Mondrian";
import { BottomAxis } from "./BottomAxis";
import { GridColumns } from "./GridColumns";
import { GridRows } from "./GridRows";
import { LeftAxis } from "./LeftAxis";
import type { Scale, Scales, TickFormatters } from "../types";

type Props = {
  chart: AbstractChart<unknown, unknown>;
  gridColumnsShown?: boolean;
  gridRowsShown?: boolean;
  gridBordersShown?: boolean;
  gridDashArray?: string;
  gridStrokeColor?: string;
  scales: Scales;
  tickFormatters: TickFormatters;
};

export const GridWithAxes = memo(function GridWithAxes({
  chart,
  gridColumnsShown = true,
  gridRowsShown = true,
  gridBordersShown = true,
  gridDashArray,
  gridStrokeColor,
  scales,
  tickFormatters,
}: Props) {
  const { xMax, xScale, yMax, yScale } = scales;

  const { colorBase300 } = useTheme();
  const strokeColor = gridStrokeColor || colorBase300;

  const { xAxis, yAxis } = chart;
  const minValue = useCustomSpring(yAxis.minValue);
  const maxValue = useCustomSpring(yAxis.maxValue);

  const animatedScale = yScale.copy().domain([minValue, maxValue]);

  const xTicks = useMemo(
    () => getTicks(xAxis, xMax, xScale, 12, getMaxXTickValue),
    [xAxis, xMax, xScale],
  );
  const yTicks = useMemo(
    () => getTicks(yAxis, yMax, animatedScale, 8, getMaxYTickValue),
    [yAxis, yMax, animatedScale],
  );

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
          scales={scales}
          stroke={strokeColor}
          strokeDasharray={gridDashArray}
          xAxis={xAxis}
          xTicks={xTicks}
        />
      )}
      <BottomAxis
        formatter={tickFormatters.xFormatter}
        scales={scales}
        strokeColor={strokeColor}
        strokeDasharray={gridDashArray}
        ticks={xTicks}
        xAxis={xAxis}
      />
      <LeftAxis
        formatter={tickFormatters.yFormatter}
        scales={{ ...scales, yScale: animatedScale }}
        strokeColor={strokeColor}
        strokeDasharray={gridDashArray}
        strokeWidth={gridBordersShown ? 1 : 0}
        ticks={yTicks}
      />
    </>
  );
});

function getTicks(
  axis: Axis,
  max: number,
  scale: Scale,
  numTicks: number,
  getMaxAllowedTick: (ticks: Array<number>, maxValue: number) => number,
): Array<number> {
  const suggestions = axis.tickSuggestions;
  const ticks = suggestions
    ? getTicksFromSuggestions(axis, suggestions, numTicks)
    : getTicksFromRange(axis.minValue, axis.maxValue, numTicks);

  extendTicksToFitAxis(ticks, axis, max, scale, 2 * numTicks);
  removeLastTickIfTooCloseToMax(ticks, axis.maxValue, getMaxAllowedTick);

  return ticks;
}

function getTicksFromRange(
  minValue: number,
  maxValue: number,
  numTicks: number,
): Array<number> {
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
  axis: Axis,
  suggestions: Array<number>,
  numTicks: number,
): Array<number> {
  const len = suggestions.length;
  if (len < 2) {
    return suggestions;
  }

  const suggestionInterval = suggestions[1] - suggestions[0];
  const axisRange = axis.maxValue - axis.minValue;
  const ticksPerRange = axisRange / suggestionInterval;
  if (ticksPerRange < numTicks) {
    return suggestions;
  }

  const ticks = [];
  const divisionFactor = Math.ceil(ticksPerRange / numTicks);
  for (let i = 0; i < len; i++) {
    if (i % divisionFactor === 0) {
      ticks.push(suggestions[i]);
    }
  }

  return ticks;
}

/**
 * Extends the ticks to cover the full range of the axis.
 *
 * Due to animations/translations it is possible the ticks don't yet cover the
 * full range of the axis. This function extends the ticks as necessary, and
 * also includes a slight margin to prevent a "pop-in" effect of suddenly
 * appearing tick labels from the right edge.
 *
 * @note This function mutates the input ticks.
 */
function extendTicksToFitAxis(
  ticks: Array<number>,
  axis: Axis,
  max: number,
  scale: Scale,
  maxTicks: number,
) {
  if (ticks.length < 2) {
    return;
  }

  const interval = ticks[1] - ticks[0];
  const scaleToAxis = (value: number) =>
    scale((value - axis.minValue) / (axis.maxValue - axis.minValue));

  // Trim ticks from the start if the user has dragged them beyond the Y axis.
  while (ticks.length && scaleToAxis(ticks[0]) < 0) {
    ticks.shift();
  }

  let preTick = ticks[0] - interval;
  while (ticks.length < maxTicks && scaleToAxis(preTick) >= 0) {
    ticks.unshift(preTick);
    preTick -= interval;
  }

  let postTick = ticks[ticks.length - 1] + interval;
  while (ticks.length < maxTicks && scaleToAxis(postTick) < 1.1 * max) {
    ticks.push(postTick);
    postTick += interval;
  }
}

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

/**
 * When rendering our svg charts, we want to avoid cutting off tick labels.
 * The way we can do this (simiar to visx's solution) is by not rendering ticks,
 * if they are too close to the axis's max value.
 *
 * The definition of what is "too close" to the max value
 * is determined by the `getMaxTickValue` function.
 *
 * @note This function mutates the input ticks.
 */
const removeLastTickIfTooCloseToMax = (
  ticks: Array<number>,
  maxValue: number,
  getMaxAllowedTick: (ticks: Array<number>, maxValue: number) => number,
) => {
  if (ticks.length < 2) {
    return;
  }

  const maxTickValue = getMaxAllowedTick(ticks, maxValue);

  const lastTick = ticks[ticks.length - 1];
  if (lastTick > maxTickValue) {
    ticks.pop();
  }
};

/**
 * Returns a maximum allowed tick value for the x-axis.
 *
 * Heuristic:
 *   If a tick's distance to the maxValue is within 1/2 the size of the tick-interval,
 *   the tick will get dropped.
 *
 * Note that the heuristic was determined by trial and error.
 */
const getMaxXTickValue = (ticks: Array<number>, maxValue: number) => {
  if (ticks.length < 2) {
    return maxValue;
  }

  const interval = ticks[1] - ticks[0];
  return maxValue - interval / 2;
};

/**
 * Returns a maximum allowed tick value for the x-axis.
 *
 * Heuristic:
 *   If a tick's distance to the maxValue is within 1/3 the size of the tick-interval,
 *   the tick will get dropped.
 *
 * Note that the heuristic was determined by trial and error.
 */
const getMaxYTickValue = (ticks: Array<number>, maxValue: number) => {
  if (ticks.length < 2) {
    return maxValue;
  }

  const interval = ticks[1] - ticks[0];
  return maxValue - interval / 3;
};
