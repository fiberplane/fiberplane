import type { DefaultTheme } from "styled-components";

export function getChartColor(i: number, colors: string[]) {
    return colors[i % colors.length];
}
