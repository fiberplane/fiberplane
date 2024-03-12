import { useHandler } from "@fiberplane/hooks";
import { memo, useContext, useMemo, useState } from "react";
import { styled } from "styled-components";

import { ChartSizeContainerProvider, CoreChart } from "../CoreChart";
import { HEIGHT, MARGINS } from "../CoreChart/constants";
import { type SeriesSource, type ShapeList, generate } from "../Mondrian";
import { TimeseriesLegend } from "../TimeseriesLegend";
import type { Theme } from "../chartThemeTypes";
import type { Metric, ProviderEvent, Timeseries } from "../providerTypes";
import { ChartThemeContext, defaultChartTheme } from "../theme";
import { ChartControls } from "./ChartControls";
import type { MetricsChartProps } from "./types";

type GenericShapeList = ShapeList<SeriesSource, Metric | ProviderEvent | null>;

type TimeseriesShapeList = ShapeList<Timeseries, Metric>;

export function MetricsChart(props: MetricsChartProps) {
  const chartTheme: Theme = useMemo(
    () => ({
      ...defaultChartTheme,
      ...props.chartTheme,
    }),
    [props.chartTheme],
  );

  return (
    <ChartThemeContext.Provider value={chartTheme}>
      <StyledChartSizeContainerProvider
        overrideHeight={HEIGHT}
        marginTop={MARGINS.top}
        marginRight={MARGINS.right}
        marginBottom={MARGINS.bottom}
        marginLeft={MARGINS.left}
      >
        <InnerMetricsChart {...props} />
      </StyledChartSizeContainerProvider>
    </ChartThemeContext.Provider>
  );
}

const InnerMetricsChart = memo(function InnerMetricsChart(
  props: MetricsChartProps,
) {
  const {
    areaGradientShown = true,
    chartControlsShown = true,
    customChartControls,
    events,
    graphType,
    legendShown = true,
    readOnly,
    stackingControlsShown = true,
    stackingType,
    targetLatency,
    timeRange,
    timeseriesData,
  } = props;

  const chart = useMemo(
    () =>
      generate({
        events: events ?? [],
        graphType,
        stackingType,
        targetLatency,
        timeRange,
        timeseriesData,
      }),
    [events, graphType, stackingType, targetLatency, timeRange, timeseriesData],
  );

  const { eventColor, shapeListColors, targetLatencyColor } =
    useContext(ChartThemeContext);

  const [focusedShapeList, setFocusedShapeList] =
    useState<GenericShapeList | null>(null);

  const getShapeListColor = useMemo(() => {
    return (source: SeriesSource, index: number): string => {
      switch (source.type) {
        case "timeseries":
          return shapeListColors[index % shapeListColors.length];
        case "events":
          return eventColor;
        case "target_latency":
          return targetLatencyColor || "transparent";
      }
    };
  }, [eventColor, shapeListColors, targetLatencyColor]);

  const onFocusedShapeListChange = useHandler(
    (shapeList: GenericShapeList | null) => {
      if (!shapeList || isTimeseriesShapeList(shapeList)) {
        setFocusedShapeList(shapeList);
      }
    },
  );

  // When the timeseries changes, we want to reset the id so that the legend
  // is re-rendered. This resets the size values for all legend items
  // biome-ignore lint/correctness/useExhaustiveDependencies: this is intentional
  const id = useMemo(() => crypto.randomUUID(), [timeseriesData]);

  return (
    <>
      {chartControlsShown && !readOnly && (
        <ChartControls {...props} stackingControlsShown={stackingControlsShown}>
          {customChartControls}
        </ChartControls>
      )}
      <CoreChart
        {...props}
        areaGradientShown={areaGradientShown}
        chart={chart}
        focusedShapeList={focusedShapeList}
        getShapeListColor={getShapeListColor}
        onFocusedShapeListChange={onFocusedShapeListChange}
      />
      {legendShown && (
        <TimeseriesLegend
          {...props}
          key={id}
          getShapeListColor={getShapeListColor}
          onFocusedShapeListChange={onFocusedShapeListChange}
          shapeLists={chart.shapeLists.filter(isTimeseriesShapeList)}
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

function isTimeseriesShapeList(
  shapeList: GenericShapeList,
): shapeList is TimeseriesShapeList & { source: { type: "timeseries" } } {
  return shapeList.source.type === "timeseries";
}
