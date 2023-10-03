import { useContext } from "react";

import { ChartThemeContext } from "../../theme";
import type { Scales, TickFormatters } from "../types";

type Props = {
  formatter?: TickFormatters["yFormatter"];
  axisLinesShown: boolean;
  scales: Scales;
  strokeColor: string;
  strokeDasharray?: string;
  ticks: Array<number>;
};

export function YAxis({
  formatter,
  axisLinesShown,
  scales: { xMax, yMax, yScale },
  strokeColor,
  strokeDasharray,
  ticks,
}: Props) {
  const {
    axisColor,
    axisFontSize,
    axisFontFamily,
    axisFontStyle,
    axisFontWeight,
    axisLetterSpacing,
  } = useContext(ChartThemeContext);

  const tickLabelProps = {
    dx: "-0.45em",
    dy: "0.25em",
    textAnchor: "end" as const,
    fontFamily: axisFontFamily,
    fontStyle: axisFontStyle,
    fontWeight: axisFontWeight,
    fontSize: axisFontSize,
    letterSpacing: axisLetterSpacing,
    fill: axisColor,
  };

  const numTicks = ticks.length - 1;

  return (
    <g>
      {axisLinesShown && (
        <>
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={yMax}
            stroke={strokeColor}
            strokeDasharray={strokeDasharray}
          />
          <line
            x1={xMax}
            x2={xMax}
            y1={0}
            y2={yMax}
            stroke={strokeColor}
            strokeDasharray={strokeDasharray}
          />
        </>
      )}

      {formatter &&
        ticks.map((value, index) =>
          (index > 0 || index < numTicks - 1) && value.valueOf() !== 0 ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: no better key available
            <text key={index} x={0} y={yScale(value)} {...tickLabelProps}>
              {formatter(value)}
            </text>
          ) : null,
        )}
    </g>
  );
}
