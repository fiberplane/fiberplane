import styled, { useTheme } from "styled-components";
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
    colors?: Array<string>;
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
  const theme = useTheme();

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

    return (_source: Timeseries, index: number): string =>
      shapeListColors[index % shapeListColors.length];
  }, [colors, theme]);

  return (
    <StyledChartSizeContainerProvider>
      <CoreChart
        areaGradientShown={areaGradientShown}
        chart={chart}
        focusedShapeList={null}
        getShapeListColor={getShapeListColor}
        gridColumnsShown={false}
        gridRowsShown={false}
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

// No formatters, which will cause the ticks to not be shown.
const tickFormatters: TickFormatters = {};
