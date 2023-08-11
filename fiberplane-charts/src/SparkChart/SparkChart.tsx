import styled from "styled-components";
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

type Props = Pick<
  CoreChartProps<Timeseries, Metric>,
  "onChangeTimeRange" | "areaGradientShown"
> &
  TimeseriesSourceData & {
    /**
     * Override the colors for the timeseries. If not specified several colors
     * of the theme are used.
     */
    colors: Array<string>;
  };

export function SparkChart({
  areaGradientShown = false,
  colors,
  graphType,
  stackingType,
  timeRange,
  timeseriesData,
  onChangeTimeRange,
}: Props) {
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
    return (shapeList: ShapeList<Timeseries, Metric>): string => {
      const index = chart.shapeLists.indexOf(shapeList);
      return colors[index % colors.length];
    };
  }, [chart, colors]);

  return (
    <StyledChartSizeContainerProvider>
      <CoreChart
        areaGradientShown={areaGradientShown}
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
