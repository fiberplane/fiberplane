# Autometrics theming

The Explorer theme consists of generated CSS variables & TS object by the [Figma
plugin](https://github.com/oscarvz/figma-plugin) and, if necessary, is extended
with additional values.

The plugin generates a CSS file and a TS file with references theme values. The
CSS file is loaded in `src/index.css` so it gets served as a static asset. The
TS file is used as a theme object for `styled-components`.

## Updating the theme with updated Figma values

1. Open your Figma project and open files on the left sidebar;
2. Build the plugin locally & run in Figma (follow instructions in the
   [plugin repo](https://github.com/oscarvz/figma-plugin));
3. Copy the generated CSS into `src/theme/figma/variables.css` and the TS object
   into `src/theme/figma/theme.ts` (the TS file needs to be formatted so the
   linter is happy).

All set!

> [!important]
> When updating the theme it's important you **always** update both the CSS and
> TS file as the theme object is referencing the CSS variables.

> [!important]
> Figma has a limitation where it only returns the variables in your current
> workspace. To make sure all defined variables are returned, make sure to
> follow step 1.

## Extending the theme

The theme object can be extended with values that aren't defined in Figma. These
values can be added to `src/theme/extendedTheme.ts`.

When dealing with colors it's possible to define additional colors for both
light and dark modes which'll get generated as CSS variables. Make sure to refer
to the CSS variable when defining the added color(s) in the theme object.

If it's a value that doesn't rely on light and dark mode, it can be added as a
string value to the theme object so we're not generating unnecessary CSS
variables (e.g. `border-radius` or `transition` values).
