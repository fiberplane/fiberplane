import { AxisBottom } from "@visx/axis";
import { memo } from "react";
import { useTheme } from "styled-components";

type Props = {
  yMax: number;
  strokeDasharray?: string;
};

export const Bottom = memo(function Bottom({ yMax, strokeDasharray }: Props) {
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
});
