export interface ChartTheme {
  /**
   * The color to use for rendering events.
   */
  eventColor: string;

  /**
   * The colors to use for other shape lists (usually timeseries).
   */
  shapeListColors: Array<string>;

  legendItemBorderRadius: string;
  legendItemCheckboxBorderRadius: string;
  legendItemCheckboxColor: string;
  legendItemEmphasisBackgroundColor: string;
  legendItemFont: string;
  legendItemOnHoverColor: string;
  legendItemOnHoverBackgroundColor: string;

  fontAxisColor: string;
  fontAxisFontSize: string;
  fontAxisFontFamily: string;
  fontAxisFontStyle: string;
  fontAxisFontWeight: string;
  fontAxisLetterSpacing: string;

  gridStrokeColor: string;

  targetLatencyColor: string;

  buttonActiveBackgroundColor: string;
  buttonActiveColor: string;
  buttonBackgroundColor: string;
  buttonBackgroundColorActive: string;
  buttonBackgroundColorDisabled: string;
  buttonBorderRadius: string;
  buttonColor: string;
  buttonDisabledBackgroundColor: string;
  buttonDisabledColor: string;
  buttonFocusBackgroundColor: string;
  buttonFocusBorderColor: string;
  buttonFocusColor: string;
  buttonFont: string;
  buttonHoverBackgroundColor: string;
  buttonHoverColor: string;
}

export type WithChartTheme = { $chartTheme: ChartTheme };
