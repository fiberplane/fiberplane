import { useMemo, useState } from "react";

import {
  FocusedTimeseriesApiContext,
  FocusedTimeseriesStateContext,
} from "../context";
import type { Timeseries } from "../types";

export function FocusedTimeseriesContextProvider(props: {
  children?: React.ReactNode;
}) {
  const { children } = props;

  const [focusedTimeseries, setFocusedTimeseries] = useState<Timeseries | null>(
    null,
  );
  const value = useMemo(() => ({ focusedTimeseries }), [focusedTimeseries]);

  const apiValue = useMemo(
    () => ({ setFocusedTimeseries }),
    [setFocusedTimeseries],
  );

  return (
    <FocusedTimeseriesApiContext.Provider value={apiValue}>
      <FocusedTimeseriesStateContext.Provider value={value}>
        {children}
      </FocusedTimeseriesStateContext.Provider>
    </FocusedTimeseriesApiContext.Provider>
  );
}
