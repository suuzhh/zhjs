import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";

/**
 * 创建main目录的输出
 *
 * @param {import('rollup').ModuleFormat[]} formats
 * @returns {import('rollup').RollupOptions}
 */
function outputMain(...formats) {
  const mainDevPath = "src/main.ts";

  return formats.map((format) => {
    const extension = ["module", "es", "esm"].includes(format) ? 'mjs' : 'js';
    return {
      input: mainDevPath,
      output: {
        name: "zhjs",
        file: `dist/zhjs.${format}.${extension}`,
        format,
      },
      plugins: [
        typescript({
          target: ["module", "es", "esm"].includes(format)
            ? "ESNEXT"
            : "ES2015",
          declaration: false,
        }),
        nodeResolve(),
        terser(),
      ],
    };
  });
}

/**
 * 创建array目录的输出
 *
 * @param {import('rollup').ModuleFormat[]} formats
 * @returns {import('rollup').RollupOptions}
 */
function outputArrayFolder(...formats) {
  const mainDevPath = "src/array/index.ts";

  return formats.map((format) => {
    const extension = ["module", "es", "esm"].includes(format) ? 'mjs' : 'js';
    return {
      input: mainDevPath,
      output: {
        name: "zhjs_array",
        file: `dist/zhjs_array.${format}.${extension}`,
        format,
      },
      plugins: [
        typescript({
          target: ["module", "es", "esm"].includes(format)
            ? "ESNEXT"
            : "ES2015",
          declaration: false,
        }),
        nodeResolve(),
        terser(),
      ],
    };
  });
}

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  ...outputMain("es", "iife", "umd"),
  ...outputArrayFolder("es", "iife", "umd"),
];
