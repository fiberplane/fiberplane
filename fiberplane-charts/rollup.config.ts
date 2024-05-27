import svgr from "@svgr/rollup";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";
import { defineRollupSwcOption, swc } from "rollup-plugin-swc3";
import pkg from "./package.json" with { type: "json" };

const external = Object.keys(pkg.peerDependencies);

const config = defineConfig([
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
      compact: true,
    },
    external,
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
]);

export default config;
