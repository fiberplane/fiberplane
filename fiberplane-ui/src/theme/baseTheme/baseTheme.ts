import { media } from "./media";
import { spacing } from "./spacing";

// Theme object that extends the base theme with additional values which aren't
// supported or added in Figma. Lodash's merge function is used to deeply merge
// the base theme with the extended theme.
export const baseTheme = {
  media,
  spacing,
};
