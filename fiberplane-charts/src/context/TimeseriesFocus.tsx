import { createContext, useMemo, useState } from "react";

import { noop } from "../utils";
import type { Timeseries } from "../types";

export type TimeseriesFocusValue = {
  focusedTimeseries: Timeseries | null;
};

export const TimeseriesFocusValueContext = createContext<TimeseriesFocusValue>({
  focusedTimeseries: null,
});

export type TimeseriesFocusApi = {
  setFocusedTimeseries: (focusedTimeseries: Timeseries | null) => void;
};

export const TimeseriesFocusApiContext = createContext<TimeseriesFocusApi>({
  setFocusedTimeseries: noop,
});

export function TimeseriesFocusContextProvider(props: {
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
    <TimeseriesFocusApiContext.Provider value={apiValue}>
      <TimeseriesFocusValueContext.Provider value={value}>
        {children}
      </TimeseriesFocusValueContext.Provider>
    </TimeseriesFocusApiContext.Provider>
  );
}
