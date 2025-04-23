import { useMemo } from "react";

export function useCost(value: number | null | undefined): undefined | string {
  return useMemo(() => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return undefined;
    }

    if (value === 0) {
      return "$0.00";
    }

    return `$${Number(value).toFixed(2)}`;
  }, [value]);
}
