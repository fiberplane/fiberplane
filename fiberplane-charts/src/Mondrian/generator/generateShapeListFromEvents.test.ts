import type { ProviderEvent } from "../../providerTypes";
import { generateShapeListFromEvents } from "./generateShapeListFromEvents";

test("it generates shapes from events", () => {
  const events: Array<ProviderEvent> = [
    getEventAtMinute(2, "deploy 1"),
    getEventAtMinute(7, "deploy 2"),
  ];

  expect(
    generateShapeListFromEvents(
      {
        minValue: getDateAtMinute(0).getTime(),
        maxValue: getDateAtMinute(10).getTime(),
      },
      events,
    ),
  ).toMatchSnapshot();
});

function getEventAtMinute(minute: number, title: string): ProviderEvent {
  return {
    time: getDateAtMinute(minute).toISOString(),
    title,
    labels: {},
    attributes: {},
    resource: {},
  };
}

function getDateAtMinute(minute: number): Date {
  return new Date(
    `2023-07-18T16:${minute.toString().padStart(2, "0")}:00.000Z`,
  );
}
