import type { Axis } from "./Mondrian";

export type FormatterKind =
  /**
   * Formats a number of bytes.
   *
   * ## Examples
   *
   * `0.1B`, `10B`, `10kB`.
   */
  | "bytes"

  /**
   * Formats a duration expressed in seconds.
   *
   * ## Examples
   *
   * `0.1s`, `10s`, `2h47`.
   */
  | "duration"

  /**
   * Formats a value with an optional exponent component, also referred to as
   * "E notation".
   *
   * ## Examples
   *
   * `0.1`, `10`, `1.0e4`.
   */
  | "exponent"

  /**
   * Formats a percentage value.
   *
   * ## Examples
   *
   * `0.1%`, `10%`, `10000%`.
   */
  | "percentage"

  /**
   * Formats a value using scientific notation.
   *
   * ## Examples
   *
   * `100m`, `10`, `10k`.
   */
  | "scientific"

  /**
   * Formats a time stamp expressed in seconds since the UNIX epoch.
   *
   * For brevity, the formatter omits the most significant parts of the time
   * that are constant across the axis.
   *
   * Currently, only UTC formatting is supported.
   *
   * ## Examples
   *
   * `Fri 13`, `17:15`, `57.200`
   */
  | "time";

export type TickFormatter = (value: number) => string;

export function getFormatterForAxis(
  axis: Axis,
  kind: FormatterKind,
): TickFormatter {
  switch (kind) {
    case "bytes":
      return getBytesFormatterForAxis(axis);
    case "duration":
      return getDurationFormatterForAxis(axis);
    case "exponent":
      return getExponentFormatter();
    case "percentage":
      return getPercentageFormatter();
    case "scientific":
      return getScientificFormatterForAxis(axis);
    case "time":
      return getTimeFormatterForAxis(axis);
  }
}

export function getBytesFormatterForAxis(axis: Axis): TickFormatter {
  const largestUnit = ScientificUnit.forValue(axis.maxValue);
  const minimumUnit = ScientificUnit.None;
  const scientificFormatter = getScientificFormatterForUnits(
    largestUnit,
    minimumUnit,
  );

  return (value: number): string => {
    return `${scientificFormatter(value)}B`;
  };
}

export function getDurationFormatterForAxis(axis: Axis): TickFormatter {
  const largestUnit = DurationUnit.forValue(axis.maxValue);

  return (value: number): string => {
    let unit = largestUnit;
    let adjusted = value * unit.multiplier();
    while (Math.abs(adjusted) < 1) {
      const nextUnitWithAmount = unit.nextLargest();
      if (nextUnitWithAmount) {
        adjusted *= nextUnitWithAmount[0];
        unit = nextUnitWithAmount[1];
      } else {
        break;
      }
    }

    if (Math.abs(adjusted) >= 10) {
      return `${adjusted.toFixed(1)}${unit}`;
    }

    const nextUnitWithAmount = unit.nextLargest();
    if (nextUnitWithAmount) {
      const first = Math.floor(adjusted);
      const second = Math.round((adjusted - first) * nextUnitWithAmount[0]);
      const nextUnit = nextUnitWithAmount[1];
      return `${first}${unit}${second}${nextUnit}`;
    }

    // unit must be seconds (or smaller)
    const formatter = getScientificFormatterForUnits(
      ScientificUnit.None,
      ScientificUnit.Pico,
    );
    return `${formatter(adjusted)}s`;
  };
}

export function getExponentFormatter(): TickFormatter {
  return (value: number): string => {
    const absoluteValue = Math.abs(value);
    if (absoluteValue >= 10000) {
      let adjusted = value * 0.0001;
      let exponent = 4;
      while (Math.abs(adjusted) > 10) {
        adjusted *= 0.1;
        exponent += 1;
      }

      return `${adjusted.toFixed(1)}e${exponent}`;
    } else if (absoluteValue < Number.EPSILON) {
      return "0";
    } else if (absoluteValue < 0.01) {
      let adjusted = value * 1000;
      let exponent = -3;
      while (Math.abs(adjusted) < 1) {
        adjusted *= 10;
        exponent -= 1;
      }

      return `${adjusted.toFixed(1)}e${exponent}`;
    } else if (absoluteValue < 0.1) {
      return value.toFixed(2);
    } else if (value === Math.round(value)) {
      return value.toString();
    } else {
      return value.toFixed(1);
    }
  };
}

export function getPercentageFormatter(): TickFormatter {
  return (value: number): string => {
    const percentageValue = value * 100;
    if (percentageValue === Math.round(percentageValue)) {
      return `${percentageValue}%`;
    } else {
      return `${percentageValue.toFixed(1)}%`;
    }
  };
}

export function getScientificFormatterForAxis(axis: Axis): TickFormatter {
  const largestUnit = ScientificUnit.forValue(axis.maxValue);
  let minimumUnit = ScientificUnit.forValue(axis.minValue);

  // It just looks awkward if we go into too much detail on an axis that
  // also has large numbers.
  if (
    largestUnit.isBiggerThan(ScientificUnit.None) &&
    minimumUnit.isSmallerThan(ScientificUnit.None)
  ) {
    minimumUnit = ScientificUnit.None;
  }

  return getScientificFormatterForUnits(largestUnit, minimumUnit);
}

function getScientificFormatterForUnits(
  largestUnit: ScientificUnit,
  minimumUnit: ScientificUnit,
): TickFormatter {
  return (value: number): string => {
    let unit = largestUnit;
    let adjusted = value * unit.multiplier();
    while (Math.abs(adjusted) < 0.05 && unit.isBiggerThan(minimumUnit)) {
      const nextUnit = unit.nextLargest();
      if (nextUnit) {
        unit = nextUnit;
      } else {
        break;
      }

      adjusted *= 1000;
    }

    if (Math.abs(adjusted) === 0) {
      return "0";
    } else if (adjusted >= 10 || adjusted === Math.round(adjusted)) {
      return `${adjusted.toFixed(0)}${unit}`; // avoid unnecessary `.0` suffix
    } else {
      return `${adjusted.toFixed(1)}${unit}`;
    }
  };
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getTimeFormatterForAxis(axis: Axis): TickFormatter {
  const scale = getTimeScaleForAxis(axis);

  return (value: number): string => {
    const date = new Date(value * 1000);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    switch (scale) {
      case "day_in_month":
        return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()}`;

      case "day_in_week":
        return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCHours()}h`;

      case "hours":
        return `${date.getUTCHours()}:${date
          .getUTCMinutes()
          .toString()
          .padStart(2, "0")}`;

      case "minutes":
        return `${date.getUTCHours()}:${date
          .getUTCMinutes()
          .toString()
          .padStart(2, "0")}:${date
          .getUTCSeconds()
          .toString()
          .padStart(2, "0")}`;

      case "seconds":
        return `${date.getUTCSeconds()}.${date
          .getUTCMilliseconds()
          .toString()
          .padStart(3, "0")}`;

      case "milliseconds":
        return `.${date.getUTCMilliseconds().toString().padStart(3, "0")}`;
    }
  };
}

class DurationUnit {
  static Days = new DurationUnit("days");
  static Hours = new DurationUnit("hours");
  static Minutes = new DurationUnit("minutes");
  static Seconds = new DurationUnit("seconds");

  /**
   * Returns the most appropriate unit to use for formatting the given
   * duration, without assuming any other context.
   */
  static forValue(value: number): DurationUnit {
    if (value >= 24 * 3600) {
      return DurationUnit.Days;
    } else if (value >= 3600) {
      return DurationUnit.Hours;
    } else if (value >= 60) {
      return DurationUnit.Minutes;
    } else {
      return DurationUnit.Seconds;
    }
  }

  constructor(private unit: "days" | "hours" | "minutes" | "seconds") {}

  /**
   * The multiplier to apply to a duration if it is to be formatted with this
   * unit.
   */
  multiplier(): number {
    switch (this.unit) {
      case "days":
        return 1 / (24 * 3600);
      case "hours":
        return 1 / 3600;
      case "minutes":
        return 1 / 60;
      case "seconds":
        return 1;
    }
  }

  /**
   * Returns the next largest unit smaller than this unit, as well as the
   * amount of that unit that fit into this unit, if any.
   */
  nextLargest(): [amount: number, unit: DurationUnit] | null {
    switch (this.unit) {
      case "days":
        return [24, DurationUnit.Hours];
      case "hours":
        return [60, DurationUnit.Minutes];
      case "minutes":
        return [60, DurationUnit.Seconds];
      case "seconds":
        return null;
    }
  }

  toString(): string {
    switch (this.unit) {
      case "days":
        return "d";
      case "hours":
        return "h";
      case "minutes":
        return "m";
      case "seconds":
        return "s";
    }
  }
}

class ScientificUnit {
  static Tera = new ScientificUnit(4);
  static Giga = new ScientificUnit(3);
  static Mega = new ScientificUnit(2);
  static Kilo = new ScientificUnit(1);
  static None = new ScientificUnit(0);
  static Milli = new ScientificUnit(-1);
  static Micro = new ScientificUnit(-2);
  static Nano = new ScientificUnit(-3);
  static Pico = new ScientificUnit(-4);

  constructor(private step: number) {}

  /**
   * Returns the most appropriate unit to use for formatting the given
   * value, without assuming any other context.
   */
  static forValue(value: number): ScientificUnit {
    if (value >= 1e12) {
      return ScientificUnit.Tera;
    } else if (value >= 1e9) {
      return ScientificUnit.Giga;
    } else if (value >= 1e6) {
      return ScientificUnit.Mega;
    } else if (value >= 1e3) {
      return ScientificUnit.Kilo;
    } else if (value >= 1e3) {
      return ScientificUnit.Kilo;
    } else if (value >= 1) {
      return ScientificUnit.None;
    } else if (value >= 1e-3) {
      return ScientificUnit.Milli;
    } else if (value >= 1e-6) {
      return ScientificUnit.Micro;
    } else if (value >= 1e-9) {
      return ScientificUnit.Nano;
    } else {
      return ScientificUnit.Pico;
    }
  }

  isBiggerThan(other: ScientificUnit): boolean {
    return this.step > other.step;
  }

  isSmallerThan(other: ScientificUnit): boolean {
    return this.step < other.step;
  }

  /**
   * The multiplier to apply to a value if it is to be formatted with this
   * unit.
   */
  multiplier(): number {
    switch (this.step) {
      case 4:
        return 1e-12;
      case 3:
        return 1e-9;
      case 2:
        return 1e-6;
      case 1:
        return 1e-3;
      case 0:
        return 1;
      case -1:
        return 1e3;
      case -2:
        return 1e6;
      case -3:
        return 1e9;
      case -4:
        return 1e12;
      default:
        throw new Error(`Unsupported step: ${this.step}`);
    }
  }

  /**
   * Returns the next largest unit smaller than this unit, if any.
   */
  nextLargest(): ScientificUnit | null {
    if (this.step > -4) {
      return new ScientificUnit(this.step - 1);
    } else {
      return null;
    }
  }

  toString(): string {
    switch (this.step) {
      case 4:
        return "T";
      case 3:
        return "G";
      case 2:
        return "M";
      case 1:
        return "k";
      case 0:
        return "";
      case -1:
        return "m";
      case -2:
        return "μ";
      case -3:
        return "n";
      case -4:
        return "p";
      default:
        throw new Error(`Unsupported step: ${this.step}`);
    }
  }
}

type TimeScale =
  | "day_in_month"
  | "day_in_week"
  | "hours"
  | "minutes"
  | "seconds"
  | "milliseconds";

function getTimeScaleForAxis(axis: Axis): TimeScale {
  const delta = Math.abs(axis.maxValue - axis.minValue);
  if (delta > 10 * 24 * 3600) {
    return "day_in_month";
  } else if (delta > 24 * 3600) {
    return "day_in_week";
  } else if (delta > 3600) {
    return "hours";
  } else if (delta > 60) {
    return "minutes";
  } else if (delta > 1) {
    return "seconds";
  } else {
    return "milliseconds";
  }
}
