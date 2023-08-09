import type { Metric, Timeseries } from "../../providerTypes";
import { generateBarChartFromTimeseries } from "./generateBarChartFromTimeseries";

test("it generates a bar chart", () => {
  const timeseries: Timeseries = {
    name: "dummy_data",
    labels: {},
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

  expect(
    generateBarChartFromTimeseries({
      graphType: "bar",
      stackingType: "none",
      timeRange: {
        from: getDateAtMinute(0).toISOString(),
        to: getDateAtMinute(10).toISOString(),
      },
      timeseriesData: [timeseries],
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
