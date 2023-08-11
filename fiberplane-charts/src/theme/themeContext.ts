import { createContext } from "react";
import { ChartTheme } from "..";

// TODO (Oscar): Update with proper initial colors
const defaultTheme: ChartTheme = {
  buttonBackground: "#fff",
  buttonBorderRadius: "4px",
  controlsColor: "#000",
  controlsFont: "sans-serif",
  controlsLetterSpacing: "0.5px",
  eventColor: "#000",
  button: {
    backgroundColor: "#fff",
    borderRadius: "4px",
    color: "#000",
    border: "1px solid #000",
    font: "sans-serif",
    on: {
      active: {
        border: "1px solid #000",
        color: "#000",
        backgroundColor: "#fff",
      },
      disabled: {
        border: "1px solid #000",
        color: "#000",
        backgroundColor: "#fff",
      },
      focus: {
        border: "1px solid #000",
        color: "#000",
        backgroundColor: "#fff",
      },
      hover: {
        border: "1px solid #000",
        color: "#000",
        backgroundColor: "#fff",
      },
    },
  },
  legendItem: {
    borderRadius: "6px",
    checkboxBorderRadius: "4px",
    checkboxColor: "#000",
    emphasisBackgroundColor: "#000",
    font: "sans-serif",
    on: {
      hover: {
        color: "#FFF",
        backgroundColor: "#000",
      },
    },
  },
  legendFont: "sans-serif",
  legendLetterSpacing: "0.5px",
  resultsFont: "sans-serif",
  resultsLetterSpacing: "0.5px",
  shapeListColors: ["#000"],
};

export const ThemeContext = createContext<ChartTheme>(defaultTheme);
