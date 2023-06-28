import styled, { useTheme } from "styled-components";
import { ChartSizeContainerProvider } from "../ChartSizeContainerProvider";
import { useMemo } from "react";
import { CoreChart, CoreChartProps } from "../CoreChart";

type Props = Pick<
  CoreChartProps,
  | "colors"
  | "graphType"
  | "onChangeGraphType"
  | "onChangeTimeRange"
  | "stackingType"
  | "timeRange"
  | "timeseriesData"
>;

export function SparkChart(props: Props) {
  const { colors, ...rest } = props;
  const theme = useTheme();

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
      <CoreChart {...rest} colors={chartColors} gridShown={false} />
    </StyledChartSizeContainerProvider>
  );
}

const StyledChartSizeContainerProvider = styled(ChartSizeContainerProvider)`
  width: 100%;
  height: 100%;
`;
