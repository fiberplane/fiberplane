import { memo } from "react";

import { ChartControls } from "./ChartControls";
import { Legend } from "../ChartLegend";
import { MainChartContent } from "./MainChartContent";
import type { MetricsChartProps } from "./types";
import { TimeseriesFocusContextProvider } from "../context";
import { useScales } from "../hooks";

export const MainContent = memo(function MainContent(props: MetricsChartProps) {
  const { graphType, readOnly = false, stackingType, timeseriesData } = props;
  const { valueScale, xScaleProps } = useScales(props);

  const hasMultipleTimeseries = timeseriesData.length > 1;

  const controls = !readOnly && (
    <ChartControls
      stackingType={stackingType}
      graphType={graphType}
      onGraphTypeChange={(graphType) =>
        dispatch(
          updateCell(
            cellId,
            { graphType },
            { focus: { type: "collapsed", cellId } },
          ),
        )
      }
      onStackingChange={(stackingType) =>
        dispatch(
          updateCell(
            cellId,
            { stackingType },
            { focus: { type: "collapsed", cellId } },
          ),
        )
      }
      showStackingControls={hasMultipleTimeseries}
    />
  );

  return (
    <TimeseriesFocusContextProvider>
      {controls}
      <MainChartContent {...props} yScale={valueScale} {...xScaleProps} />
      {hasMultipleTimeseries && (
        <Legend readOnly={readOnly} timeseriesData={timeseriesData} />
      )}
    </TimeseriesFocusContextProvider>
  );
});
