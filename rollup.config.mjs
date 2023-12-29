import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';


/**
 * 创建main目录的输出
 *
 * @param {import('rollup').ModuleFormat[]} formats
 * @returns {import('rollup').RollupOptions}
 */
function outputMain(...formats) {
  const mainDevPath = 'src/main.ts';

  return formats.map(format => {
    return {
      input: mainDevPath,
      output: {
        name: 'zhjs',
        file: `dist/zhjs.${format}.js`,
        format
      },
      plugins: [
        typescript({
          target: ['module', 'es', 'esm'].includes(format) ? 'ESNEXT' : 'ES2015',
          declaration: false,
        }),
        nodeResolve(),
        terser()
      ]
    }
  })
}

/**
 * 创建array目录的输出
 *
 * @param {import('rollup').ModuleFormat[]} formats
 * @returns {import('rollup').RollupOptions}
 */
function outputArrayFolder(...formats) {
  const mainDevPath = 'src/array/index.ts';

  return formats.map(format => {
    return {
      input: mainDevPath,
      output: {
        name: 'zhjs_array',
        file: `dist/zhjs_array.${format}.js`,
        format
      },
      plugins: [
        typescript({
          target: ['module', 'es', 'esm'].includes(format) ? 'ESNEXT' : 'ES2015',
          declaration: false,
        }),
        nodeResolve(),
        terser()
      ]
    }
  })
}

/**
 * 创建类型文件输出
 * @returns {import('rollup').RollupOptions}
 */
function outputDeclaration() {
  const mainDevPath = 'src/main.ts';
  const outputDir = 'dist/types';
  return [
    {
      input: mainDevPath,
      output: {
        dir: outputDir,
      },
      plugins: [
        typescript({
          // useTsconfigDeclarationDir: true,
          // tsconfigOverride: {
          //   compilerOptions: {
          //     target: 'ESNEXT',
          //     module: 'ESNEXT',
          //     "lib": [
          //       "ES2015",
          //       "DOM"
          //     ],
          //     typeRoots: [
          //       "./node_modules/@types"
          //     ],
          //     esModuleInterop: true,
          //     moduleResolution: 'node',
          //     forceConsistentCasingInFileNames: true,
          //     skipLibCheck: true,
          //     declaration: true,
          //     emitDeclarationOnly: true
          //   }
          // }
          declaration: true,
          emitDeclarationOnly: true,
          declarationDir: outputDir,
          // outDir: outputDir,
        })
      ]
    }
  ]

}

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  ...outputMain('es', 'iife', 'umd'),
  ...outputArrayFolder('es', 'iife', 'umd')
]
