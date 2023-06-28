import type { DefaultTheme } from "styled-components";

export function getChartColor(i: number, colors: Array<string>) {
  return colors[i % colors.length];
}
