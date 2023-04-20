import { memo, useMemo } from "react";
import styled from "styled-components";

import { ChartControls } from "./ChartControls";
import {
    ChartSizeContainerProvider,
    CoreControlsContext,
    InteractiveControlsContext,
    InteractiveControlsStateContext,
    TimeseriesFocusContextProvider,
} from "../context";
import {
    CoreControls,
    InteractiveControls,
    useCoreControls,
    useInteractiveControls,
} from "../hooks";
import { Legend } from "../ChartLegend";
import type { MetricsChartProps } from "./types";
import { MainChartContent } from "./MainChartContent";

export function MetricsChart(props: MetricsChartProps) {
    return props.readOnly ? (
        <ReadOnlyMetricsChart {...props} />
    ) : (
        <InteractiveMetricsChart {...props} />
    );
}

function InteractiveMetricsChart(props: MetricsChartProps) {
    const coreControls = useCoreControls(props);
    const { interactiveControlsState, ...interactiveControls } =
        useInteractiveControls();

    const { reset, startDrag, startZoom, updateEndValue } = interactiveControls;

    const interactiveControlsValue = useMemo<InteractiveControls>(
        () => ({ reset, startDrag, startZoom, updateEndValue }),
        [reset, startDrag, startZoom, updateEndValue],
    );

    const coreControlsValue = useMemo<CoreControls>(
        () => ({ zoom: coreControls.zoom, move: coreControls.move }),
        [coreControls.move, coreControls.zoom],
    );

    return (
        <CoreControlsContext.Provider value={coreControlsValue}>
            <InteractiveControlsContext.Provider
                value={interactiveControlsValue}
            >
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
        <TimeseriesFocusContextProvider>
            {!props.readOnly && (
                <ChartControls
                    {...props}
                    showStackingControls={hasMultipleTimeseries}
                />
            )}
            <MainChartContent {...props} />
            {hasMultipleTimeseries && <Legend {...props} />}
        </TimeseriesFocusContextProvider>
    );
});

const StyledChartSizeContainerProvider = styled(ChartSizeContainerProvider)`
  display: flex;
  gap: 12px;
  flex-direction: column;
`;
