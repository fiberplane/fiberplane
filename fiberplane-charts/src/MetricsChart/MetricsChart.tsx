import { memo, useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";

import { ChartControls } from "./ChartControls";
import { ChartSizeContainerProvider } from "../CoreChart";
import { CoreChart } from "../CoreChart";
import { generate, SeriesSource, ShapeList } from "../Mondrian";
import { HEIGHT, MARGINS } from "../CoreChart/constants";
import type { Metric, ProviderEvent, Timeseries } from "../providerTypes";
import type { MetricsChartProps } from "./types";
import { TimeseriesLegend } from "../TimeseriesLegend";
import { useHandler } from "../hooks";

type GenericShapeList = ShapeList<SeriesSource, Metric | ProviderEvent | null>;

type TimeseriesShapeList = ShapeList<Timeseries, Metric>;

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
  const theme = useTheme();

  const {
    areaGradientShown = true,
    chartControlsShown = true,
    colors,
    customChartControls,
    events,
    eventColor = theme.colorPrimary400,
    graphType,
    legendShown = true,
    readOnly,
    stackingControlsShown = true,
    stackingType,
    targetLatency,
    targetLatencyColor,
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

  const [focusedShapeList, setFocusedShapeList] =
    useState<GenericShapeList | null>(null);

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
  }, [colors, eventColor, targetLatencyColor, theme]);

  const onFocusedShapeListChange = useHandler(
    (shapeList: GenericShapeList | null) => {
      if (!shapeList || isTimeseriesShapeList(shapeList)) {
        setFocusedShapeList(shapeList);
      }
    },
  );

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
