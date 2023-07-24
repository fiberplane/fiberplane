import { useTheme } from "styled-components";
import { utcFormat } from "d3-time-format";

import type { Axis } from "../../Mondrian";
import type { Scales } from "../types";

const LABEL_OFFSET = 8;

type Props = {
  scales: Scales;
  strokeColor: string;
  strokeDasharray?: string;
  ticks: Array<number>;
  xAxis: Axis;
};

export function BottomAxis({
  scales: { xMax, xScale, yMax },
  strokeColor,
  strokeDasharray,
  ticks,
  xAxis: { maxValue, minValue },
}: Props) {
  const {
    colorBase500,
    fontAxisFontSize,
    fontAxisFontFamily,
    fontAxisFontStyle,
    fontAxisFontWeight,
    fontAxisLetterSpacing,
  } = useTheme();

  const formatter = getTimeFormatter(ticks);

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

      {ticks.map((time, index) => (
        <text
          // rome-ignore lint/suspicious/noArrayIndexKey: no better key available
          key={index}
          x={xScale((time - minValue) / (maxValue - minValue))}
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
          {formatter(time)}
        </text>
      ))}
    </g>
  );
}

function getTimeFormatter(ticks: Array<number>): (time: number) => string {
  if (ticks.length < 2) {
    // If there's only a single tick, just display the full timestamp.
    return (time) => new Date(time).toISOString();
  }

  const timeScale = getTimeScale(ticks[0], ticks[1]);
  const formatter = getFormatter(timeScale);

  return (time) => formatter(new Date(time));
}

type TimeScale = "milliseconds" | "seconds" | "minutes" | "hours" | "days";

function getTimeScale(time1: number, time2: number): TimeScale {
  const delta = time2 - time1;
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
