import type { Metric } from "../../../providerTypes";
import { splitIntoContinuousLines } from "./splitIntoContinuousLines";

test("it splits metrics that are spaced too far apart", () => {
  expect(
    splitIntoContinuousLines(
      [getMetric(0, 10), getMetric(1, 15), getMetric(2, 20)],
      30_000, // ms,
    ),
  ).toEqual([[getMetric(0, 10)], [getMetric(1, 15)], [getMetric(2, 20)]]);
});

test("it doesn't split when the metrics are close to one another", () => {
  expect(
    splitIntoContinuousLines(
      [getMetric(0, 10), getMetric(1, 15), getMetric(2, 20)],
      300_000, // ms,
    ),
  ).toEqual([[getMetric(0, 10), getMetric(1, 15), getMetric(2, 20)]]);
});

test("it handles unevenly spaced metrics", () => {
  expect(
    splitIntoContinuousLines(
      [getMetric(0, 10), getMetric(1, 15), getMetric(3, 20), getMetric(4, 25)],
      60_000, // ms,
    ),
  ).toEqual([
    [getMetric(0, 10), getMetric(1, 15)],
    [getMetric(3, 20), getMetric(4, 25)],
  ]);
});

test("it doesn't split when no interval is given", () => {
  expect(
    splitIntoContinuousLines([
      getMetric(0, 10),
      getMetric(1, 15),
      getMetric(2, 20),
    ]),
  ).toEqual([[getMetric(0, 10), getMetric(1, 15), getMetric(2, 20)]]);
});

test("it splits metrics when it finds a NaN value", () => {
  expect(
    splitIntoContinuousLines(
      [getMetric(0, 10), getMetric(1, NaN), getMetric(2, 20)],
      300000, // ms,
    ),
  ).toEqual([[getMetric(0, 10)], [getMetric(2, 20)]]);
});

function getMetric(minute: number, value: number): Metric {
  return {
    time: new Date(
      `2023-07-18T16:${minute.toString().padStart(2, "0")}:00.000Z`,
    ).toISOString(),
    value,
    attributes: {},
    resource: {},
  };
}