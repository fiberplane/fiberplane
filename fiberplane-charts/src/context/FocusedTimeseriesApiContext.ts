import { createContext } from "react";

import { noop } from "../utils";
import type { Timeseries } from "../types";

export type FocusedTimeseriesApi = {
    setFocusedTimeseries: (focusedTimeseries: Timeseries | null) => void;
};

export const FocusedTimeseriesApiContext = createContext<FocusedTimeseriesApi>({
    setFocusedTimeseries: noop,
});
