import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";
import { defineRollupSwcOption, swc } from "rollup-plugin-swc3";
import pkg from "./package.json" with { type: "json" };

const external = Object.keys(pkg.peerDependencies);

export default defineConfig([
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
      compact: true,
    },
    external,
    plugins: [swc(defineRollupSwcOption({ sourceMaps: true }))],
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
