import { extendedTheme } from "./extendedTheme/extendedTheme";

type Theme = typeof extendedTheme;

declare module "styled-components" {
  // biome-ignore lint/suspicious/noEmptyInterface: <explanation>
  export interface DefaultTheme extends Theme {}
}
