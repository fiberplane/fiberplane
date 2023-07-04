import type { AbstractChart, ChartInputData } from "../types";
import { generateAbstractBarChart } from "./generateAbstractBarChart";
import { generateAbstractLineChart } from "./generateAbstractLineChart";
import { generateAbstractStackedBarChart } from "./generateAbstractStackedBarChart";
import { generateAbstractStackedLineChart } from "./generateAbstractStackedLineChart";

export function generateAbstractChart(input: ChartInputData): AbstractChart {
  if (input.graphType === "line") {
    return input.stackingType === "none"
      ? generateAbstractLineChart(input)
      : generateAbstractStackedLineChart(input);
  } else {
    return input.stackingType === "none"
      ? generateAbstractBarChart(input)
      : generateAbstractStackedBarChart(input);
  }
}
