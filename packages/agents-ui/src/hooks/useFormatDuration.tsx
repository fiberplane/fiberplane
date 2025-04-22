import { useMemo } from "react";

/**
 * Time unit type
 */
export type TimeUnit = "ms" | "s" | "m" | "h";

/**
 * Options for the useFormatDuration hook
 */
export interface FormatDurationOptions {
  /** Base unit of the input value ('ms', 's', 'm', 'h') */
  unit?: TimeUnit;
  /**
   * Maximum number of decimal places.
   * Will be automatically reduced for large numbers:
   * - Values >= 10: `precision` decimal places
   * - Values >= 100: 1 decimal places
   * - Values >= 1000: 0 decimal places
   */
  precision?: number;
  /** Whether to automatically choose the most appropriate unit */
  autoScale?: boolean;
  /** Available units for auto-scaling */
  units?: TimeUnit[];
  /** Whether to dynamically adjust precision based on value magnitude. Default: true */
  dynamicPrecision?: boolean;
}

const DEFAULT_DURATION: Array<TimeUnit> = ["ms", "s", "m", "h"];

/**
 * React hook for formatting duration values into human-readable strings
 *
 * @param value - The duration value to format
 * @param options - Formatting options
 * @returns Formatted duration string
 */
export function useFormatDuration(
  value: number | null | undefined,
  options: FormatDurationOptions = {},
): string {
  const {
    unit = "ms",
    precision = 2,
    autoScale = true,
    units = DEFAULT_DURATION,
    dynamicPrecision = true,
  } = options;

  return useMemo(() => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "";
    }

    // Convert everything to milliseconds first
    let valueInMs = Number(value);
    switch (unit) {
      case "s":
        valueInMs = valueInMs * 1000;
        break;
      case "m":
        valueInMs = valueInMs * 60 * 1000;
        break;
      case "h":
        valueInMs = valueInMs * 60 * 60 * 1000;
        break;
    }

    // If auto-scaling is disabled, format in the specified unit
    if (!autoScale) {
      return `${Number(value).toFixed(precision)}${unit}`;
    }

    // Auto-scale to the most appropriate unit
    const thresholds: Record<TimeUnit, number> = {
      ms: 0,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
    };

    // Filter units based on the provided units array
    const availableUnits = Object.keys(thresholds).filter((u) =>
      units.includes(u as TimeUnit),
    ) as TimeUnit[];

    // Sort available units by threshold (smallest to largest)
    availableUnits.sort((a, b) => thresholds[a] - thresholds[b]);

    // Find the appropriate unit
    let selectedUnit = availableUnits[0]; // Default to the smallest available unit

    for (let i = availableUnits.length - 1; i >= 0; i--) {
      const currentUnit = availableUnits[i];
      if (valueInMs >= thresholds[currentUnit]) {
        selectedUnit = currentUnit;
        break;
      }
    }

    // Convert value to the selected unit
    let formattedValue: number;
    switch (selectedUnit) {
      case "ms":
        formattedValue = valueInMs;
        break;
      case "s":
        formattedValue = valueInMs / 1000;
        break;
      case "m":
        formattedValue = valueInMs / (60 * 1000);
        break;
      case "h":
        formattedValue = valueInMs / (60 * 60 * 1000);
        break;
    }

    // Dynamically adjust precision based on the magnitude of the number
    let adjustedPrecision = precision;

    if (dynamicPrecision) {
      if (formattedValue >= 10 && formattedValue < 100) {
        // For values between 10 and 99, use at most 1 decimal place
        adjustedPrecision = Math.min(precision, 1);
      } else if (formattedValue >= 100) {
        // For values 1000 and above, use 0 decimal places
        adjustedPrecision = 0;
      }
    }

    return `${formattedValue.toFixed(adjustedPrecision)}${selectedUnit}`;
  }, [value, unit, precision, autoScale, dynamicPrecision, units]);
}
