import { useMemo } from "react";
import styled from "styled-components";

import { ChartSizeContainerProvider } from "../ChartSizeContainer";
import {
  CoreControls,
  InteractiveControls,
  useCoreControls,
  useInteractiveControls,
} from "../hooks";
import {
  InteractiveControlsContext,
  InteractiveControlsStateContext,
  CoreControlsContext,
} from "../context";
import { MainContent } from "./MainContent";
import type { MetricsChartProps } from "./types";

function ChartMainInteractive(props: MetricsChartProps) {
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
    <div>
      <CoreControlsContext.Provider value={coreControlsValue}>
        <InteractiveControlsContext.Provider value={interactiveControlsValue}>
          <InteractiveControlsStateContext.Provider
            value={interactiveControlsState}
          >
            <StyledChartSizeContainerProvider>
              <MainContent {...props} />
            </StyledChartSizeContainerProvider>
          </InteractiveControlsStateContext.Provider>
        </InteractiveControlsContext.Provider>
      </CoreControlsContext.Provider>
    </div>
  );
}

function ChartMainReadOnly(props: MetricsChartProps) {
  return (
    <ChartSizeContainerProvider>
      <MainContent {...props} />
    </ChartSizeContainerProvider>
  );
}

export function MetricsChart(props: MetricsChartProps) {
  return props.readOnly ? (
    <ChartMainReadOnly {...props} />
  ) : (
    <ChartMainInteractive {...props} />
  );
}

const StyledChartSizeContainerProvider = styled(ChartSizeContainerProvider)`
  display: flex;
  gap: 12px;
  flex-direction: column;
`;
