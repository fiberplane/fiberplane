import styled, { useTheme } from "styled-components";
import { useMemo } from "react";

import {
  ChartSizeContainerProvider,
  CoreChart,
  CoreChartProps,
  TickFormatters,
} from "../CoreChart";
import { Metric, Timeseries } from "../providerTypes";
import {
  ShapeList,
  TimeseriesSourceData,
  generateFromTimeseries,
} from "../Mondrian";

type Props = Pick<CoreChartProps<Timeseries, Metric>, "onChangeTimeRange"> &
  TimeseriesSourceData & {
    /**
     * Override the colors for the timeseries. If not specified several colors
     * of the theme are used.
     */
    colors?: Array<string>;
  };

export function SparkChart({
  colors,
  graphType,
  stackingType,
  timeRange,
  timeseriesData,
  onChangeTimeRange,
}: Props) {
  const theme = useTheme();

  const chart = useMemo(
    () =>
      generateFromTimeseries({
        graphType,
        stackingType,
        timeRange,
        timeseriesData,
      }),
    [graphType, stackingType, timeRange, timeseriesData],
  );

  const getShapeListColor = useMemo(() => {
    const shapeListColors = colors || [
      theme["colorSupport1400"],
      theme["colorSupport2400"],
      theme["colorSupport3400"],
      theme["colorSupport4400"],
      theme["colorSupport5400"],
      theme["colorSupport6400"],
      theme["colorSupport7400"],
      theme["colorSupport8400"],
      theme["colorSupport9400"],
      theme["colorSupport10400"],
      theme["colorSupport11400"],
    ];

    return (shapeList: ShapeList<Timeseries, Metric>): string => {
      const index = chart.shapeLists.indexOf(shapeList);
      return shapeListColors[index % shapeListColors.length];
    };
  }, [chart, colors, theme]);

  return (
    <StyledChartSizeContainerProvider>
      <CoreChart
        chart={chart}
        focusedShapeList={null}
        getShapeListColor={getShapeListColor}
        gridShown={false}
        onChangeTimeRange={onChangeTimeRange}
        tickFormatters={tickFormatters}
        timeRange={timeRange}
      />
    </StyledChartSizeContainerProvider>
  );
}

const StyledChartSizeContainerProvider = styled(ChartSizeContainerProvider)`
  width: 100%;
  height: 100%;
`;

// Dummy formatters, since we don't display axes in a spark chart anyway.
const tickFormatters: TickFormatters = {
  xFormatter: () => "",
  yFormatter: () => "",
};
