import { getTicks } from "@visx/scale";
import { memo } from "react";
import { useTheme } from "styled-components";

import type { Scales } from "../types";

type Props = {
  numTicks: number;
  scales: Scales;
  strokeColor: string;
  strokeDasharray?: string;
  strokeWidth: number;
};

export const LeftAxis = memo(function LeftAxis({
  numTicks,
  scales: { yMax, yScale },
  strokeColor,
  strokeDasharray,
  strokeWidth,
}: Props) {
  const {
    colorBase500,
    fontAxisFontSize,
    fontAxisFontFamily,
    fontAxisFontStyle,
    fontAxisFontWeight,
    fontAxisLetterSpacing,
  } = useTheme();

  const tickLabelProps = {
    dx: "-0.45em",
    dy: "0.25em",
    textAnchor: "end" as const,
    fontFamily: fontAxisFontFamily,
    fontStyle: fontAxisFontStyle,
    fontWeight: fontAxisFontWeight,
    fontSize: fontAxisFontSize,
    letterSpacing: fontAxisLetterSpacing,
    fill: colorBase500,
  };

  const formatter = yScale.tickFormat(10, "~s");

  return (
    <g>
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={yMax}
        stroke={strokeColor}
        strokeDasharray={strokeDasharray}
        strokeWidth={strokeWidth}
      />

      {getTicks(yScale, numTicks).map((value, index) =>
        (index > 0 || index < numTicks - 1) && value.valueOf() !== 0 ? (
          // rome-ignore lint/suspicious/noArrayIndexKey: no better key available
          <text key={index} x={0} y={yScale(value)} {...tickLabelProps}>
            {formatter(value)}
          </text>
        ) : null,
      )}
    </g>
  );
});
