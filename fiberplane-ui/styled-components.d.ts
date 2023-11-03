import { extendedTheme } from "./src/theme";

type Theme = typeof extendedTheme;

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
