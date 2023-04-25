import { memo } from "react";
import styled from "styled-components";

import { ChartControls } from "./ChartControls";
import { ChartSizeContainerProvider } from "./ChartSizeContainerProvider";
import {
    CoreControlsContext,
    InteractiveControlsContext,
    InteractiveControlsStateContext,
} from "../context";
import { FocusedTimeseriesContextProvider } from "./FocusedTimeseriesContextProvider";
import { Legend } from "../ChartLegend";
import { MainChartContent } from "./MainChartContent";
import type { MetricsChartProps } from "./types";
import { useCoreControls, useInteractiveControls } from "../hooks";

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
            <InteractiveControlsContext.Provider value={interactiveControls}>
                <InteractiveControlsStateContext.Provider
                    value={interactiveControlsState}
                >
                    <StyledChartSizeContainerProvider>
                        <InnerMetricsChart {...props} />
                    </StyledChartSizeContainerProvider>
                </InteractiveControlsStateContext.Provider>
            </InteractiveControlsContext.Provider>
        </CoreControlsContext.Provider>
    );
}

function ReadOnlyMetricsChart(props: MetricsChartProps) {
    return (
        <ChartSizeContainerProvider>
            <InnerMetricsChart {...props} />
        </ChartSizeContainerProvider>
    );
}
const InnerMetricsChart = memo(function InnerMetricsChart(
    props: MetricsChartProps,
) {
    const hasMultipleTimeseries = props.timeseriesData.length > 1;

    return (
        <FocusedTimeseriesContextProvider>
            {!props.readOnly && (
                <ChartControls
                    {...props}
                    showStackingControls={hasMultipleTimeseries}
                />
            )}
            <MainChartContent {...props} />
            {hasMultipleTimeseries && <Legend {...props} />}
        </FocusedTimeseriesContextProvider>
    );
});

const StyledChartSizeContainerProvider = styled(ChartSizeContainerProvider)`
  display: flex;
  gap: 12px;
  flex-direction: column;
`;
