import { dts } from 'rollup-plugin-dts';


/**
 * @returns {import('rollup').RollupOptions}
 */
function createMainConfig() {
  return {
    input: `./_temp/types/main.d.ts`,
    output: {
      file: `dist/types/zhjs.d.ts`,
      format: 'es',
    },
    plugins: [dts()]
  }
}

/**
 * @returns {import('rollup').RollupOptions}
 */
function createArrayConfig() {
  return {
    input: `./_temp/types/array/index.d.ts`,
    output: {
      file: `dist/types/array/index.d.ts`,
      format: 'es',
    },
    plugins: [dts()]
  }
}

/**
 * @type {import('rollup').RollupOptions}
 */
export default [createMainConfig(), createArrayConfig()]