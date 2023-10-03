import { defineRollupSwcOption, swc } from "rollup-plugin-swc3";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "es",
    sourcemap: true,
  },
  external: [],
  plugins: [swc(defineRollupSwcOption({ sourceMaps: true }))],
};
