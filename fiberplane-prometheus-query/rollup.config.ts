import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";
import { defineRollupSwcOption, swc } from "rollup-plugin-swc3";

const swcPlugin = swc(defineRollupSwcOption({ sourceMaps: true }));

export default defineConfig([
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
      compact: true,
    },
    external: [],
    plugins: [swcPlugin],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [swcPlugin, dts()],
  },
]);
