import { createContext } from "react";

import { noop } from "../../utils";
import type { ShapeList } from "../../ACG";

export type FocusedShapeListApi<S, P> = {
  setFocusedShapeList: (focusedShapeList: ShapeList<S, P> | null) => void;
};

export type FocusedShapeListState<S, P> = {
  focusedShapeList: ShapeList<S, P> | null;
};

export const FocusedShapeListApiContext = createContext<
  FocusedShapeListApi<unknown, unknown>
>({ setFocusedShapeList: noop });

export const FocusedShapeListStateContext = createContext<
  FocusedShapeListState<unknown, unknown>
>({ focusedShapeList: null });
