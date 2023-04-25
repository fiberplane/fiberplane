import { createContext } from "react";

export type InteractiveControls = {
    reset(): void;
    startDrag(start: number | null): void;
    startZoom(start: number | null): void;
    updateEndValue(end: number): void;
};

/**
 * One of two parts of the useInteractiveControlState hook results
 *
 * This is the api/functional part
 */
export const InteractiveControlsContext = createContext<InteractiveControls>({
    reset() {},
    startDrag() {},
    startZoom() {},
    updateEndValue() {},
});
