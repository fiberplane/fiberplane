import type { Axis } from "../../types";
import { attachSuggestionsToXAxis } from "./attachSuggestionsToXAxis";

test("it attaches the right suggestions", () => {
  const buckets = new Map<string, number>();
  buckets.set(getDateAtMinuteAndSecond(1, 0).toISOString(), 10);
  buckets.set(getDateAtMinuteAndSecond(2, 0).toISOString(), 15);
  buckets.set(getDateAtMinuteAndSecond(3, 0).toISOString(), 20);

  const axis: Axis = {
    minValue: getDateAtMinuteAndSecond(0, 23).getTime() / 1000,
    maxValue: getDateAtMinuteAndSecond(4, 23).getTime() / 1000,
  };
  attachSuggestionsToXAxis(axis, buckets, 60);

  expect(axis.tickSuggestions).toEqual([
    getDateAtMinuteAndSecond(1, 0).getTime() / 1000,
    getDateAtMinuteAndSecond(2, 0).getTime() / 1000,
    getDateAtMinuteAndSecond(3, 0).getTime() / 1000,
    getDateAtMinuteAndSecond(4, 0).getTime() / 1000,
  ]);
});

test("it doesn't return suggestions outside the min-max", () => {
  const buckets = new Map<string, number>();
  buckets.set(getDateAtMinuteAndSecond(0, 0).toISOString(), 5);
  buckets.set(getDateAtMinuteAndSecond(1, 0).toISOString(), 10);
  buckets.set(getDateAtMinuteAndSecond(2, 0).toISOString(), 15);
  buckets.set(getDateAtMinuteAndSecond(3, 0).toISOString(), 20);
  buckets.set(getDateAtMinuteAndSecond(4, 0).toISOString(), 25);
  buckets.set(getDateAtMinuteAndSecond(5, 0).toISOString(), 30);

  const axis: Axis = {
    minValue: getDateAtMinuteAndSecond(0, 23).getTime() / 1000,
    maxValue: getDateAtMinuteAndSecond(4, 23).getTime() / 1000,
  };
  attachSuggestionsToXAxis(axis, buckets, 60);

  expect(axis.tickSuggestions).toEqual([
    getDateAtMinuteAndSecond(1, 0).getTime() / 1000,
    getDateAtMinuteAndSecond(2, 0).getTime() / 1000,
    getDateAtMinuteAndSecond(3, 0).getTime() / 1000,
    getDateAtMinuteAndSecond(4, 0).getTime() / 1000,
  ]);
});

function getDateAtMinuteAndSecond(minute: number, second: number): Date {
  return new Date(
    `2023-07-18T16:${minute.toString().padStart(2, "0")}:${second
      .toString()
      .padStart(2, "0")}.000Z`,
  );
}
