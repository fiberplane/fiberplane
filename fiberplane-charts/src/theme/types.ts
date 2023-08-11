export interface ChartTheme {
  buttonBackground: string;
  buttonBorderRadius: string;
  controlsColor: string;
  controlsFont: string;
  controlsLetterSpacing: string;
  button: Button;
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

  legendItem: {
    borderRadius: string;
    checkboxBorderRadius: string;
    checkboxColor: string;
    emphasisBackgroundColor: string;
    font: string;
    on: {
      hover: {
        color: string;
        backgroundColor: string;
      };
    };
  };

  gridStrokeColor: string;

  fontAxisColor: string;
  fontAxisFontSize: string;
  fontAxisFontFamily: string;
  fontAxisFontStyle: string;
  fontAxisFontWeight: string;
  fontAxisLetterSpacing: string;
}

type Button = {
  backgroundColor: string;
  borderRadius: string;
  color: string;
  border: string;
  font: string;
  on: {
    hover: ButtonStyle;
    active: ButtonStyle;
    focus: ButtonStyle;
    disabled: ButtonStyle;
  };
};

type ButtonStyle = {
  backgroundColor: string;
  color: string;
  border: string;
};

export type WithChartTheme = { theme: ChartTheme };
