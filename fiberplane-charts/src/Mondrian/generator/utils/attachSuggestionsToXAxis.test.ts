import { attachSuggestionsToXAxis } from "./attachSuggestionsToXAxis";
import type { Axis } from "../../types";

test("it attaches the right suggestions", () => {
  const buckets = new Map<string, number>();
  buckets.set(getDateAtMinuteAndSecond(1, 0).toISOString(), 10);
  buckets.set(getDateAtMinuteAndSecond(2, 0).toISOString(), 15);
  buckets.set(getDateAtMinuteAndSecond(3, 0).toISOString(), 20);

  const axis: Axis = {
    minValue: getDateAtMinuteAndSecond(0, 23).getTime(),
    maxValue: getDateAtMinuteAndSecond(4, 23).getTime(),
  };
  attachSuggestionsToXAxis(axis, buckets, 60_000);

  expect(axis.tickSuggestions).toEqual([
    getDateAtMinuteAndSecond(1, 0).getTime(),
    getDateAtMinuteAndSecond(2, 0).getTime(),
    getDateAtMinuteAndSecond(3, 0).getTime(),
    getDateAtMinuteAndSecond(4, 0).getTime(),
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
    minValue: getDateAtMinuteAndSecond(0, 23).getTime(),
    maxValue: getDateAtMinuteAndSecond(4, 23).getTime(),
  };
  attachSuggestionsToXAxis(axis, buckets, 60_000);

  expect(axis.tickSuggestions).toEqual([
    getDateAtMinuteAndSecond(1, 0).getTime(),
    getDateAtMinuteAndSecond(2, 0).getTime(),
    getDateAtMinuteAndSecond(3, 0).getTime(),
    getDateAtMinuteAndSecond(4, 0).getTime(),
  ]);
});

function getDateAtMinuteAndSecond(minute: number, second: number): Date {
  return new Date(
    `2023-07-18T16:${minute.toString().padStart(2, "0")}:${second
      .toString()
      .padStart(2, "0")}.000Z`,
  );
}
