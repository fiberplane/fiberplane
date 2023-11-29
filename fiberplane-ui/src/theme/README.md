# Autometrics theming

The Explorer theme consists of generated CSS variables & TS object by the [Figma
plugin](https://github.com/oscarvz/figma-plugin) and can be extended with
additional values.

The plugin generates two TypeScript files: one with an object containing `light`
& `dark` CSS variables; the other contains a theme object with references to the
theme values.
The CSS variables are used in `src/theme/globalStyle`. The TS file is used as a
theme object in the theme provider.

## Updating the theme with updated Figma values

1. (when only having read access) Open Figma and open all files on the left
  sidebar;
2. Build the plugin locally & run in Figma (follow instructions in the
  [plugin repo](https://github.com/oscarvz/figma-plugin));
3. Copy the generated CSS into `src/theme/figma/variables.ts` and the TS object
  into `src/theme/figma/theme.ts` (the TS file needs to be formatted so the
  linter is happy).

All set!

> [!important]
> Figma has a limitation where it only returns the variables in your current
> workspace when you only have read access to the project. To make sure all
> defined variables are returned, make sure to follow step 1.

> [!important]
> When updating the theme it's important you **always** update both the CSS and
> TS file as the theme object is referencing the CSS variables.


## Extending the theme

The theme object can be extended with values that aren't defined in Figma. These
values can be added to `src/theme/extendedTheme/extendedTheme.ts`.

When dealing with colors it's possible to define additional colors for both
light and dark modes which'll get generated as CSS variables. Make sure to refer
to the CSS variable when defining the added color(s) in the theme object.

If it's a value that doesn't rely on light and dark mode, it can be added as a
string value to the theme object so we're not generating unnecessary CSS
variables (e.g. `border-radius` or `transition` values).
