import { AxisBottom, TickFormatter } from "@visx/axis";
import { getTicks } from "@visx/scale";
import { memo, useMemo } from "react";
import type { NumberValue } from "d3-scale";
import { useTheme } from "styled-components";
import { utcFormat } from "d3-time-format";

import type { Scale } from "../types";

type Props = {
  strokeDasharray?: string;
  xScale: Scale;
  yMax: number;
};

export const Bottom = memo(function Bottom({
  strokeDasharray,
  xScale,
  yMax,
}: Props) {
  const {
    colorBase300,
    colorBase500,
    fontAxisFontSize,
    fontAxisFontFamily,
    fontAxisFontStyle,
    fontAxisFontWeight,
    fontAxisLetterSpacing,
    fontAxisLineHeight,
  } = useTheme();

  const axisBottomTickLabelProps = {
    textAnchor: "middle" as const,
    fontFamily: fontAxisFontFamily,
    fontStyle: fontAxisFontStyle,
    fontWeight: fontAxisFontWeight,
    fontSize: fontAxisFontSize,
    letterSpacing: fontAxisLetterSpacing,
    lineHeight: fontAxisLineHeight,
    fill: colorBase500,
  };

  const formatter = useMemo(() => getTimeFormatter(xScale), [xScale]);

  return (
    <AxisBottom
      top={yMax}
      scale={xScale}
      stroke={colorBase300}
      hideTicks={true}
      tickFormat={formatter}
      tickLabelProps={axisBottomTickLabelProps}
      strokeDasharray={strokeDasharray}
    />
  );
});

function getTimeFormatter(scale: Scale): TickFormatter<NumberValue> {
  const ticks = getTicks(scale, 10);
  if (ticks.length === 0) {
    return (item) => item.toString();
  }

  const first = ticks[0];
  const second = ticks[1];

  const timeScale =
    first !== undefined && second !== undefined
      ? getTimeScale(first, second)
      : "hours";
  const formatter = getFormatter(timeScale);

  return (item) => {
    const value = new Date(item.valueOf());
    return formatter(value);
  };
}

type TimeScale = "milliseconds" | "seconds" | "minutes" | "hours" | "days";

function getTimeScale(time1: NumberValue, time2: NumberValue): TimeScale {
  const delta = time2.valueOf() - time1.valueOf();
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
      return utcFormat(":%S");
    case "minutes":
      return utcFormat("%I:%M");
    case "hours":
      return utcFormat("%I %p");
    case "days":
      return utcFormat("%a %d");
  }
}
