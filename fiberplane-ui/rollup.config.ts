import { defineConfig } from "rollup";
import { defineRollupSwcOption, swc } from "rollup-plugin-swc3";
import svgr from "@svgr/rollup";
import dts from "rollup-plugin-dts";
import css from "rollup-plugin-import-css";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonJs from "@rollup/plugin-commonjs";

const config = defineConfig([
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
      compact: true,
    },
    external: [
      "react",
      "react/jsx-runtime",
      "styled-components",
      "react-router-dom",
    ],
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
    input: "src/index.ts",
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
      sourcemap: true,
      compact: true,
    },
    external: ["styled-components", "react/jsx-runtime"],
    plugins: [
      swc(defineRollupSwcOption({ sourceMaps: true })),
      css({ output: "variables.css", minify: true }),
      commonJs(),
      nodeResolve({
        resolveOnly: (module) => module === "lodash.merge",
      }),
    ],
  },
  {
    input: "src/theme/index.ts",
    output: {
      file: "dist/theme/index.d.ts",
      format: "es",
    },
    plugins: [swc(defineRollupSwcOption({ sourceMaps: true })), dts(), css()],
  },
]);

export default config;
