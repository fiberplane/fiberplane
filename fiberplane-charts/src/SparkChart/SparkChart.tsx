import styled from "styled-components";
import { useMemo } from "react";

import {
  ChartSizeContainerProvider,
  CoreChart,
  CoreChartProps,
  TickFormatters,
} from "../CoreChart";
import { Metric, Timeseries } from "../providerTypes";
import { TimeseriesSourceData, generateFromTimeseries } from "../Mondrian";

type Props = Pick<
  CoreChartProps<Timeseries, Metric>,
  "onChangeTimeRange" | "areaGradientShown"
> &
  Omit<TimeseriesSourceData, "additionalValues"> & {
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
        additionalValues: [],
      }),
    [graphType, stackingType, timeRange, timeseriesData],
  );

  const getShapeListColor = useMemo(() => {
    return (_source: Timeseries, index: number): string =>
      colors[index % colors.length];
  }, [colors]);

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
