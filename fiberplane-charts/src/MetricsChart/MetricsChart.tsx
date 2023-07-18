import { memo, useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";

import { ChartControls } from "./ChartControls";
import { ChartSizeContainerProvider } from "../CoreChart";
import type { CloseTooltipFn, MetricsChartProps, TooltipAnchor } from "./types";
import { CoreChart } from "../CoreChart";
import { HEIGHT, MARGINS } from "../CoreChart/constants";
import type { Metric, Timeseries } from "../providerTypes";
import { noop } from "../utils";
import { ShapeList, generateFromTimeseries } from "../Mondrian";
import { TimeseriesLegend } from "../TimeseriesLegend";
import { Tooltip } from "./Tooltip";
import { useHandler } from "../hooks";

export function MetricsChart(props: MetricsChartProps) {
  return (
    <StyledChartSizeContainerProvider
      overrideHeight={HEIGHT}
      marginTop={MARGINS.top}
      marginRight={MARGINS.right}
      marginBottom={MARGINS.bottom}
      marginLeft={MARGINS.left}
    >
      <InnerMetricsChart {...props} />
    </StyledChartSizeContainerProvider>
  );
}

const InnerMetricsChart = memo(function InnerMetricsChart(
  props: MetricsChartProps,
) {
  const {
    chartControlsShown = true,
    colors,
    graphType,
    legendShown = true,
    readOnly,
    stackingControlsShown = true,
    stackingType,
    timeRange,
    timeseriesData,
  } = props;

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

  const [focusedShapeList, setFocusedShapeList] = useState<ShapeList<
    Timeseries,
    Metric
  > | null>(null);

  const theme = useTheme();

  const chartColors = useMemo(
    () =>
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
      ],
    [theme, colors],
  );

  const showTooltip = useHandler(
    (
      anchor: TooltipAnchor,
      [timeseries, metric]: [Timeseries, Metric],
    ): CloseTooltipFn =>
      props.showTooltip?.(
        anchor,
        <Tooltip timeseries={timeseries} metric={metric} />,
      ) ?? noop,
  );

  return (
    <>
      {chartControlsShown && !readOnly && (
        <ChartControls
          {...props}
          stackingControlsShown={stackingControlsShown}
        />
      )}
      <CoreChart
        {...props}
        chart={chart}
        colors={chartColors}
        focusedShapeList={focusedShapeList}
        onFocusedShapeListChange={setFocusedShapeList}
        showTooltip={showTooltip}
      />
      {legendShown && (
        <TimeseriesLegend
          {...props}
          chart={chart}
          colors={chartColors}
          onFocusedShapeListChange={setFocusedShapeList}
        />
      )}
    </>
  );
});

const StyledChartSizeContainerProvider = styled(ChartSizeContainerProvider)`
  display: flex;
  gap: 12px;
  flex-direction: column;
`;
