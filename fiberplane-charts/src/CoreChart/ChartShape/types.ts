import type { Scales } from "../types";

export type CommonShapeProps = {
  /**
   * Whether any shape list is focused.
   *
   * Some shapes indicate whether they are focused by de-emphasizing other
   * shapes. Such de-emphasizing should only be done when any (other) shape
   * is focused.
   */
  anyFocused: boolean;

  /**
   * Show a gradient under Line or Area shapes in the chart.
   */
  areaGradientShown: boolean;

  /**
   * The shape's color, based on the shape list it belongs to.
   */
  color: string;

  /**
   * Whether the shape list the shape belongs to is currently focused.
   */
  focused: boolean;

  /**
   * Chart scales for converting abstract coordinates to pixel values.
   */
  scales: Scales;
};
