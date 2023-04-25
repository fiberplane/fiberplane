import { createContext } from "react";

import type { Timeseries } from "../types";

export type FocusedTimeseriesState = {
    focusedTimeseries: Timeseries | null;
};

export const FocusedTimeseriesStateContext =
    createContext<FocusedTimeseriesState>({ focusedTimeseries: null });
