import { swc, defineRollupSwcOption } from "rollup-plugin-swc3";
import dts from "rollup-plugin-dts";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.d.ts",
    format: "es",
  },
  plugins: [swc(defineRollupSwcOption({ sourceMaps: true })), dts()],
};
