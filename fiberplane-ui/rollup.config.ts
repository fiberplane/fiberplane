import svgr from "@svgr/rollup";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";
import { defineRollupSwcOption, swc } from "rollup-plugin-swc3";

export default defineConfig([
  {
    input: "src/components/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
      compact: true,
    },
    external: ["react", "react/jsx-runtime", "styled-components"],
    plugins: [
      svgr({
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  removeViewBox: false,
                },
              },
            },
            // Enable prefix ids so that the generated ids are less likely to
            // clash (otherwise the generated ids will be a,b,c, etc) and not
            // unique, which can cause weird issues when you display multiple
            // svg's on a page
            "prefixIds",
          ],
        },
      }),
      swc(defineRollupSwcOption({ sourceMaps: true })),
    ],
  },
  {
    input: "src/components/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [swc(defineRollupSwcOption({ sourceMaps: true })), dts()],
  },
  {
    input: "src/theme/index.ts",
    output: {
      file: "dist/theme/index.js",
      format: "es",
      compact: true,
    },
    external: ["react/jsx-runtime", "styled-components", "lodash.merge"],
    plugins: [
      svgr({
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  removeViewBox: false,
                },
              },
            },
            // Enable prefix ids so that the generated ids are less likely to
            // clash (otherwise the generated ids will be a,b,c, etc) and not
            // unique, which can cause weird issues when you display multiple
            // svg's on a page
            "prefixIds",
          ],
        },
      }),
      swc(defineRollupSwcOption({ sourceMaps: true })),
    ],
  },
  {
    input: "src/theme/index.ts",
    output: { file: "dist/theme/index.d.ts", format: "es" },
    plugins: [dts()],
  },
]);
