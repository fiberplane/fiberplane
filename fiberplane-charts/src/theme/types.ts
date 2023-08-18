export interface ChartTheme {
  axisColor?: string;
  axisFontFamily?: string;
  axisFontSize?: string;
  axisFontStyle?: string;
  axisFontWeight?: string;
  axisLetterSpacing?: string;

  buttonActiveBackgroundColor?: string;
  buttonActiveColor?: string;
  buttonBackgroundColor?: string;
  buttonBorderRadius?: string;
  buttonColor?: string;
  buttonDisabledBackgroundColor?: string;
  buttonDisabledColor?: string;
  buttonFocusBackgroundColor?: string;
  buttonFocusBorderColor?: string;
  buttonFocusColor?: string;
  buttonFocusOutline?: string;
  buttonFont?: string;
  buttonHoverBackgroundColor?: string;
  buttonHoverColor?: string;

  buttonGroupBackgroundColor?: string;
  buttonGroupBorderRadius?: string;

  /**
   * The color to use for rendering events.
   */
  eventColor?: string;

  /**
   * The color to use for the gradient applied to an expandable event.
   */
  expandableGradientColor?: string;

  /**
   * The color applied to the grid lines.
   */
  gridStrokeColor?: string;

  legendItemBorderRadius?: string;
  legendItemCheckboxBorderRadius?: string;
  legendItemCheckboxColor?: string;
  legendItemColor?: string;
  legendItemEmphasisBackgroundColor?: string;
  legendItemEmphasisBorderRadius?: string;
  legendItemEmphasisColor?: string;
  legendItemEmphasisFont?: string;
  legendItemFont?: string;
  legendItemOnHoverBackgroundColor?: string;
  legendItemOnHoverColor?: string;

  legendResultsColor?: string;
  legendResultsFont?: string;
  legendResultsLetterSpacing?: string;

  /**
   * The colors to use for other shape lists (usually timeseries).
   */
  shapeListColors?: Array<string>;

  targetLatencyColor?: string;
}
