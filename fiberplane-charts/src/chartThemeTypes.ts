// Separate internal types from the public API to avoid exposing
import { ChartTheme } from "./theme";

export type Theme = Required<ChartTheme>;

export type WithChartTheme = { $chartTheme: Theme };
