import { createContext } from "react";

export type CoreControls = {
  zoom(factor: number, focusRatio?: number): void;
  move(deltaRation: number): void;
};

/**
 * Context that handles the result of useCoreControls hooks
 */
export const CoreControlsContext = createContext<CoreControls>({
  zoom() {},
  move() {},
});
