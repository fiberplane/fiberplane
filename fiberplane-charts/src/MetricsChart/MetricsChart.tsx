import { memo, useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";

import { ChartControls } from "./ChartControls";
import { ChartSizeContainerProvider } from "../CoreChart";
import {
  CoreChart,
  CoreControlsContext,
  InteractiveControlsApiContext,
  InteractiveControlsStateContext,
} from "../CoreChart";
import { ShapeList, generateFromTimeseries } from "../ACG";
import { HEIGHT, MARGINS } from "../CoreChart/constants";
import type { Metric, Timeseries } from "../providerTypes";
import type { MetricsChartProps } from "./types";
import { TimeseriesLegend } from "../TimeseriesLegend";
import { useCoreControls, useInteractiveControls } from "../CoreChart";

export function MetricsChart(props: MetricsChartProps) {
  return props.readOnly ? (
    <ReadOnlyMetricsChart {...props} />
  ) : (
    <InteractiveMetricsChart {...props} />
  );
}

function InteractiveMetricsChart(props: MetricsChartProps) {
  const coreControls = useCoreControls(props);
  const { interactiveControls, interactiveControlsState } =
    useInteractiveControls();

  return (
    <CoreControlsContext.Provider value={coreControls}>
      <InteractiveControlsApiContext.Provider value={interactiveControls}>
        <InteractiveControlsStateContext.Provider
          value={interactiveControlsState}
        >
          <StyledChartSizeContainerProvider
            overrideHeight={HEIGHT}
            marginTop={MARGINS.top}
            marginRight={MARGINS.right}
            marginBottom={MARGINS.bottom}
            marginLeft={MARGINS.left}
          >
            <InnerMetricsChart {...props} />
          </StyledChartSizeContainerProvider>
        </InteractiveControlsStateContext.Provider>
      </InteractiveControlsApiContext.Provider>
    </CoreControlsContext.Provider>
  );
}

function ReadOnlyMetricsChart(props: MetricsChartProps) {
  return (
    <ChartSizeContainerProvider
      overrideHeight={HEIGHT}
      marginTop={MARGINS.top}
      marginRight={MARGINS.right}
      marginBottom={MARGINS.bottom}
      marginLeft={MARGINS.left}
    >
      <InnerMetricsChart {...props} />
    </ChartSizeContainerProvider>
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
