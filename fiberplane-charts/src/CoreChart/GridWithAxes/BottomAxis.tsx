import { getTicks } from "@visx/scale";
import type { NumberValue } from "d3-scale";
import { memo } from "react";
import { useTheme } from "styled-components";
import { utcFormat } from "d3-time-format";

import { Axis } from "../../Mondrian";
import type { Scales } from "../types";

const LABEL_OFFSET = 8;

type Props = {
  numTicks: number;
  scales: Scales;
  strokeColor: string;
  strokeDasharray?: string;
  xAxis: Axis;
};

export const BottomAxis = memo(function BottomAxis({
  numTicks,
  scales: { xMax, xScale, yMax },
  strokeColor,
  strokeDasharray,
  xAxis,
}: Props) {
  const {
    colorBase500,
    fontAxisFontSize,
    fontAxisFontFamily,
    fontAxisFontStyle,
    fontAxisFontWeight,
    fontAxisLetterSpacing,
  } = useTheme();

  const formatter = getTimeFormatter(xAxis, numTicks);

  return (
    <g transform={`translate(0, ${yMax})`}>
      <line
        x1={0}
        y1={0}
        x2={xMax}
        y2={0}
        stroke={strokeColor}
        strokeDasharray={strokeDasharray}
      />

      {getTicks(xScale, numTicks).map((value, index) => (
        <text
          // rome-ignore lint/suspicious/noArrayIndexKey: no better key available
          key={index}
          x={xScale(value)}
          y={fontAxisFontSize}
          dy={LABEL_OFFSET}
          fill={colorBase500}
          fontFamily={fontAxisFontFamily}
          fontStyle={fontAxisFontStyle}
          fontWeight={fontAxisFontWeight}
          fontSize={fontAxisFontSize}
          letterSpacing={fontAxisLetterSpacing}
          textAnchor="middle"
        >
          {formatter(value)}
        </text>
      ))}
    </g>
  );
});

function getTimeFormatter(
  { minValue, maxValue }: Axis,
  numTicks: number,
): (time: NumberValue) => string {
  const timeScale = getTimeScale(minValue, maxValue, numTicks);
  const formatter = getFormatter(timeScale);

  return (item) => {
    const value = new Date(minValue + item.valueOf() * (maxValue - minValue));
    return formatter(value);
  };
}

type TimeScale = "milliseconds" | "seconds" | "minutes" | "hours" | "days";

function getTimeScale(
  time1: number,
  time2: number,
  numTicks: number,
): TimeScale {
  const delta = (time2 - time1) / numTicks;
  if (delta < 1000) {
    return "milliseconds";
  } else if (delta < 60 * 1000) {
    return "seconds";
  } else if (delta < 60 * 60 * 1000) {
    return "minutes";
  } else if (delta < 24 * 60 * 60 * 1000) {
    return "hours";
  } else {
    return "days";
  }
}

function getFormatter(unit: TimeScale): ReturnType<typeof utcFormat> {
  switch (unit) {
    case "milliseconds":
      return utcFormat(".%L");
    case "seconds":
      return utcFormat("%M:%S");
    case "minutes":
      return utcFormat("%I:%M");
    case "hours":
      return utcFormat("%I %p");
    case "days":
      return utcFormat("%a %d");
  }
}
