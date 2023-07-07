import { useMemo, useState } from "react";

import {
  FocusedShapeListApiContext,
  FocusedShapeListStateContext,
} from "../CoreChart";
import type { Timeseries } from "../types";

export function FocusedShapeListContextProvider(props: {
  children?: React.ReactNode;
}) {
  const { children } = props;

  const [focusedShapeList, setFocusedShapeList] = useState<Timeseries | null>(
    null,
  );
  const value = useMemo(() => ({ focusedShapeList }), [focusedShapeList]);

  const apiValue = useMemo(
    () => ({ setFocusedShapeList }),
    [setFocusedShapeList],
  );

  return (
    <FocusedShapeListApiContext.Provider value={apiValue}>
      <FocusedShapeListStateContext.Provider value={value}>
        {children}
      </FocusedShapeListStateContext.Provider>
    </FocusedShapeListApiContext.Provider>
  );
}
