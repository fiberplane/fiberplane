import { AxisBottom, TickFormatter } from "@visx/axis";
import type { NumberValue } from "d3-scale";
import { memo } from "react";
import { useTheme } from "styled-components";

import { XScaleTypes } from "../../MetricsChart/scales";

type Props = {
  xMax: number;
  yMax: number;
  xScale: XScaleTypes;
  xScaleFormatter?: TickFormatter<Date | NumberValue>;
  strokeDasharray?: string;
};

function Bottom({ yMax, xScale, xScaleFormatter, strokeDasharray }: Props) {
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

  return (
    <AxisBottom
      top={yMax}
      scale={xScale}
      stroke={colorBase300}
      hideTicks={true}
      tickFormat={xScaleFormatter}
      tickLabelProps={() => axisBottomTickLabelProps}
      strokeDasharray={strokeDasharray}
    />
  );
}

export default memo(Bottom);
