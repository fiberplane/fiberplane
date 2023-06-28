import { swc, defineRollupSwcOption } from "rollup-plugin-swc3";
import svgr from "@svgr/rollup";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "es",
    sourcemap: true,
  },
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
          // Enable prefix ids so that the generated ids
          // are less likely to clash (otherwise the generated ids will be a,b,c, etc)
          // and not unique, which can cause weird issues when you display multiple
          // svg's on a page
          "prefixIds",
        ],
      },
    }),
    swc(defineRollupSwcOption({ sourceMaps: true })),
  ],
};
