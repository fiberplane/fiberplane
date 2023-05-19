import { memo, useMemo } from "react";
import styled, { useTheme } from "styled-components";

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
    props: MetricsChartProps
) {
    const {
        readOnly,
        legendShown = true,
        chartControlsShown = true,
        stackingControlsShown = true,
        colors,
    } = props;

    const theme = useTheme();

    const chartColors = useMemo(() => {
        return colors || [
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
    }, [theme, colors]);


    return (
        <FocusedTimeseriesContextProvider>
            {!readOnly && chartControlsShown && (
                <ChartControls
                    {...props}
                    stackingControlsShown={stackingControlsShown}
                />
            )}
            <MainChartContent {...props} colors={chartColors}/>
            {legendShown && <Legend {...props} colors={chartColors}/>}
        </FocusedTimeseriesContextProvider>
    );
});

const StyledChartSizeContainerProvider = styled(ChartSizeContainerProvider)`
    display: flex;
    gap: 12px;
    flex-direction: column;
`;
