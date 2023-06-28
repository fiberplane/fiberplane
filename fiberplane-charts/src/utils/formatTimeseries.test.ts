import { formatTimeseries } from "./formatTimeseries";

test("formats a metric into a sorted string", () => {
  expect(
    formatTimeseries({
      name: "http_requests_total",
      labels: {
        handler: "unknown",
        app: "api",
      },
      metrics: [],
      visible: true,
      attributes: {},
      resource: {},
    }),
  ).toEqual('http_requests_total{"app":"api", "handler":"unknown"}');
});

test("formats a metric into a unsorted string", () => {
  expect(
    formatTimeseries(
      {
        name: "http_requests_total",
        labels: {
          handler: "unknown",
          app: "api",
        },
        metrics: [],
        visible: true,
        attributes: {},
        resource: {},
      },
      { sortLabels: false },
    ),
  ).toEqual('http_requests_total{"handler":"unknown", "app":"api"}');
});
