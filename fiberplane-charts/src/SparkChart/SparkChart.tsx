import styled, { useTheme } from "styled-components";
import { useMemo } from "react";

import { ChartSizeContainerProvider } from "../ChartSizeContainerProvider";
import { ChartInputData, generateAbstractChart } from "../ACG";
import { CoreChart, CoreChartProps } from "../CoreChart";

type Props = Pick<CoreChartProps, "colors" | "onChangeTimeRange"> &
  ChartInputData;

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
      generateAbstractChart({
        graphType,
        stackingType,
        timeRange,
        timeseriesData,
      }),
    [graphType, stackingType, timeRange, timeseriesData],
  );

  const chartColors = useMemo((): Array<string> => {
    return (
      colors || [
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
      ]
    );
  }, [theme, colors]);

  return (
    <StyledChartSizeContainerProvider>
      <CoreChart
        chart={chart}
        colors={chartColors}
        gridShown={false}
        onChangeTimeRange={onChangeTimeRange}
        timeRange={timeRange}
      />
    </StyledChartSizeContainerProvider>
  );
}

const StyledChartSizeContainerProvider = styled(ChartSizeContainerProvider)`
  width: 100%;
  height: 100%;
`;
