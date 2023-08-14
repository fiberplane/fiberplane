import { createContext } from "react";
import { Theme } from "..";

// expand this to include all the theme properties
export const defaultChartTheme: Theme = {
  buttonActiveBackgroundColor: "",
  buttonActiveColor: "",
  buttonBackgroundColor: "",
  buttonBackgroundColorActive: "",
  buttonBackgroundColorDisabled: "",
  buttonBorderRadius: "",
  buttonColor: "",
  buttonDisabledBackgroundColor: "",
  buttonDisabledColor: "",
  buttonFocusBackgroundColor: "",
  buttonFocusBorderColor: "",
  buttonFocusColor: "",
  buttonFont: "",
  buttonHoverBackgroundColor: "",
  buttonHoverColor: "",
  eventColor: "#000",
  fontAxisColor: "#000",
  fontAxisFontFamily: "sans-serif",
  fontAxisFontSize: "12px",
  fontAxisFontStyle: "normal",
  fontAxisFontWeight: "normal",
  fontAxisLetterSpacing: "0",
  gridStrokeColor: "#000",
  legendItemBorderRadius: "0",
  legendItemCheckboxBorderRadius: "0",
  legendItemCheckboxColor: "#000",
  legendItemEmphasisBackgroundColor: "#000",
  legendItemFont: "sans-serif",
  legendItemOnHoverBackgroundColor: "#000",
  legendItemOnHoverColor: "#000",
  shapeListColors: ["#000"],
  targetLatencyColor: "#000",
};

export const ChartThemeContext = createContext<Theme>(defaultChartTheme);
