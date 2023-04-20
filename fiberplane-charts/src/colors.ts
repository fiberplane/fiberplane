import type { DefaultTheme } from "styled-components";

const colors: Array<keyof DefaultTheme> = [
    "colorSupport1400",
    "colorSupport2400",
    "colorSupport3400",
    "colorSupport4400",
    "colorSupport5400",
    "colorSupport6400",
    "colorSupport7400",
    "colorSupport8400",
    "colorSupport9400",
    "colorSupport10400",
    "colorSupport11400",
];

export type SupportColors = keyof DefaultTheme;

export function getChartColor(i: number) {
    return colors[i % colors.length];
}
