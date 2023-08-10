export interface ChartTheme {
    buttonBackground: string;
    buttonBorderRadius: string;
    controlsColor: string;
    controlsFont: string;
    controlsLetterSpacing: string;
    iconButton: IconButtonTheme;
    legendFont: string;
    legendLetterSpacing: string;
    resultsFont: string;
    resultsLetterSpacing: string;

    /**
     * The color to use for rendering events.
     */
    eventColor: string;

    /**
     * The colors to use for other shape lists (usually timeseries).
     */
    shapeListColors: Array<string>;
}

export type IconButtonColorSet = {
    color: string;
    backgroundColor: string;
};

export type IconButtonTheme = {
    normal: IconButtonColorSet;
    hover: IconButtonColorSet;
    active: IconButtonColorSet;
    focus: IconButtonColorSet;
    disabled: IconButtonColorSet;
};

export type WithChartTheme = { theme: ChartTheme };
