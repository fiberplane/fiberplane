import { extendedTheme } from "./extendedTheme";

type Theme = typeof extendedTheme;

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
