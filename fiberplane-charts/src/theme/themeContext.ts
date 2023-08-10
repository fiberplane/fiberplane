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
  iconButton: {
    active: {
      color: "#000",
      backgroundColor: "#fff",
    },
    disabled: {
      color: "#000",
      backgroundColor: "#fff",
    },
    focus: {
      color: "#000",
      backgroundColor: "#fff",
    },
    hover: {
      color: "#000",
      backgroundColor: "#fff",
    },
    normal: {
      color: "#000",
      backgroundColor: "#fff",
    },
  },
  legendFont: "sans-serif",
  legendLetterSpacing: "0.5px",
  resultsFont: "sans-serif",
  resultsLetterSpacing: "0.5px",
  shapeListColors: ["#000"],
};

export const ThemeContext = createContext<ChartTheme>(defaultTheme);
