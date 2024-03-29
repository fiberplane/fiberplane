import type { Metric, Timeseries } from "../../providerTypes";
import { generateStackedLineChartFromTimeseries } from "./generateStackedLineChartFromTimeseries";

test("it generates a stacked line chart", () => {
  const timeseriesA: Timeseries = {
    name: "dummy_data",
    labels: { timeseries: "A" },
    attributes: {},
    resource: {},
    metrics: [
      getMetricAtMinute(0, 10),
      getMetricAtMinute(1, 15),
      getMetricAtMinute(2, 20),
      getMetricAtMinute(4, 25),
      getMetricAtMinute(5, 30),
      getMetricAtMinute(6, 25),
      getMetricAtMinute(7, 20),
      getMetricAtMinute(8, 15),
      getMetricAtMinute(9, 10),
    ],
    visible: true,
  };

  const timeseriesB: Timeseries = {
    name: "dummy_data",
    labels: { timeseries: "B" },
    attributes: {},
    resource: {},
    metrics: [
      getMetricAtMinute(0, 40),
      getMetricAtMinute(1, 30),
      getMetricAtMinute(2, 20),
      getMetricAtMinute(3, 10),
      getMetricAtMinute(4, 20),
      getMetricAtMinute(5, 30),
      getMetricAtMinute(6, 40),
      getMetricAtMinute(7, 50),
      getMetricAtMinute(8, 60),
      getMetricAtMinute(9, 70),
    ],
    visible: true,
  };

  expect(
    generateStackedLineChartFromTimeseries({
      graphType: "line",
      stackingType: "stacked",
      timeRange: {
        from: getDateAtMinute(0).toISOString(),
        to: getDateAtMinute(10).toISOString(),
      },
      timeseriesData: [timeseriesA, timeseriesB],
      additionalValues: [],
    }),
  ).toMatchSnapshot();
});

function getMetricAtMinute(minute: number, value: number): Metric {
  return {
    time: getDateAtMinute(minute).toISOString(),
    value,
    attributes: {},
    resource: {},
  };
}

function getDateAtMinute(minute: number): Date {
  return new Date(
    `2023-07-18T16:${minute.toString().padStart(2, "0")}:00.000Z`,
  );
}
