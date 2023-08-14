import type { Axis } from "../../Mondrian";
import type { Scales, TickFormatters } from "../types";
import { ChartThemeContext } from "../../theme";
import { useContext } from "react";

const LABEL_OFFSET = 8;

type Props = {
  formatter: TickFormatters["xFormatter"];
  scales: Scales;
  strokeColor: string;
  strokeDasharray?: string;
  ticks: Array<number>;
  xAxis: Axis;
};

export function BottomAxis({
  formatter,
  scales: { xMax, xScale, yMax },
  strokeColor,
  strokeDasharray,
  ticks,
  xAxis: { maxValue, minValue },
}: Props) {
  const {
    axisColor,
    axisFontSize,
    axisFontFamily,
    axisFontStyle,
    axisFontWeight,
    axisLetterSpacing,
  } = useContext(ChartThemeContext);

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
          y={axisFontSize}
          dy={LABEL_OFFSET}
          fill={axisColor}
          fontFamily={axisFontFamily}
          fontStyle={axisFontStyle}
          fontWeight={axisFontWeight}
          fontSize={axisFontSize}
          letterSpacing={axisLetterSpacing}
          textAnchor="middle"
        >
          {formatter(time)}
        </text>
      ))}
    </g>
  );
}
