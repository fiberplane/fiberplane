import { memo, useMemo, useState } from "react";
import styled from "styled-components";

import { ChartControls } from "./ChartControls";
import { ChartSizeContainerProvider } from "../CoreChart";
import { CoreChart } from "../CoreChart";
import {
  generateFromTimeseriesAndEvents,
  SeriesSource,
  ShapeList,
} from "../Mondrian";
import { HEIGHT, MARGINS } from "../CoreChart/constants";
import type { Metric, ProviderEvent, Timeseries } from "../providerTypes";
import type { MetricsChartProps } from "./types";
import { TimeseriesLegend } from "../TimeseriesLegend";
import { useHandler } from "../hooks";
import { ThemeContext } from "../theme";

type GenericShapeList = ShapeList<SeriesSource, Metric | ProviderEvent>;

type TimeseriesShapeList = ShapeList<Timeseries, Metric>;

export function MetricsChart(props: MetricsChartProps) {
  return (
    <ThemeContext.Provider value={props.theme}>
      <StyledChartSizeContainerProvider
        overrideHeight={HEIGHT}
        marginTop={MARGINS.top}
        marginRight={MARGINS.right}
        marginBottom={MARGINS.bottom}
        marginLeft={MARGINS.left}
      >
        <InnerMetricsChart {...props} />
      </StyledChartSizeContainerProvider>
    </ThemeContext.Provider>
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
    theme,
    timeRange,
    timeseriesData,
  } = props;

  const chart = useMemo(
    () =>
      generateFromTimeseriesAndEvents({
        events: events ?? [],
        graphType,
        stackingType,
        timeRange,
        timeseriesData,
      }),
    [events, graphType, stackingType, timeRange, timeseriesData],
  );

  const { eventColor, shapeListColors } = theme;

  const [focusedShapeList, setFocusedShapeList] =
    useState<GenericShapeList | null>(null);

  const getShapeListColor = useMemo(() => {
    return (shapeList: GenericShapeList): string => {
      if (isTimeseriesShapeList(shapeList)) {
        const index = chart.shapeLists.indexOf(shapeList);
        return shapeListColors[index % shapeListColors.length];
      } else {
        return eventColor;
      }
    };
  }, [chart, eventColor, shapeListColors]);

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
