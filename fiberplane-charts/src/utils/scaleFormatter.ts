import { getTicks } from "@visx/scale";
import type { NumberValue, ScaleBand } from "d3-scale";
import type { TickFormatter } from "@visx/axis";
import { utcFormat } from "d3-time-format";

function getFormatter(unit: TimeScale): ReturnType<typeof utcFormat> {
    switch (unit) {
        case "milliseconds":
            return utcFormat(".%L");
        case "seconds":
            return utcFormat(":%S");
        case "minutes":
            return utcFormat("%I:%M");
        case "hours":
            return utcFormat("%I %p");
    }

    // must be days
    return utcFormat("%a %d");
}

const timeScales = [
    "milliseconds",
    "seconds",
    "minutes",
    "hours",
    "days",
] as const;

export function getTimeFormatter(
    scale: ScaleBand<number>,
): TickFormatter<Date | NumberValue> {
    const ticks = getTicks(scale, 10);
    if (ticks.length === 0) {
        return (item) => item.toString();
    }

    const first = ticks[0];
    const second = ticks[1];

    const timeScale =
        first !== undefined && second !== undefined
            ? getTimeScale(first, second)
            : "hours";
    const formatter = getFormatter(timeScale);

    return (item) => {
        const value = item instanceof Date ? item : new Date(item.valueOf());
        return formatter(value);
    };
}

type TimeScale = typeof timeScales[number];

function getTimeScale(time1: number, time2: number): TimeScale {
    const delta = time2 - time1;
    if (delta < 1000) {
        return "milliseconds";
    }

    if (delta < 60 * 1000) {
        return "seconds";
    }

    if (delta < 60 * 60 * 1000) {
        return "minutes";
    }

    if (delta < 24 * 60 * 60 * 1000) {
        return "hours";
    }

    return "days";
}
