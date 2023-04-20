import { swc, defineRollupSwcOption } from "rollup-plugin-swc3";
import svgr from "@svgr/rollup";

export default {
    input: "src/index.ts",
    output: {
        file: "dist/index.js",
        sourcemap: true,
    },
    plugins: [svgr(), swc(defineRollupSwcOption({ sourceMaps: true }))],
};
