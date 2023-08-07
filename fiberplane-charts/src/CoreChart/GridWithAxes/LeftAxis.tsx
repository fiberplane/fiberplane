import { useTheme } from "styled-components";

import type { Scales, TickFormatters } from "../types";

type Props = {
  formatter: TickFormatters["yFormatter"];
  gridBordersShown: boolean;
  scales: Scales;
  strokeColor: string;
  strokeDasharray?: string;
  ticks: Array<number>;
};

export function LeftAxis({
  formatter,
  gridBordersShown,
  scales: { yMax, yScale },
  strokeColor,
  strokeDasharray,
  ticks,
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

  const numTicks = ticks.length - 1;

  return (
    <g>
      {gridBordersShown && (
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={yMax}
          stroke={strokeColor}
          strokeDasharray={strokeDasharray}
        />
      )}

      {ticks.map((value, index) =>
        (index > 0 || index < numTicks - 1) && value.valueOf() !== 0 ? (
          // rome-ignore lint/suspicious/noArrayIndexKey: no better key available
          <text key={index} x={0} y={yScale(value)} {...tickLabelProps}>
            {formatter(value)}
          </text>
        ) : null,
      )}
    </g>
  );
}
