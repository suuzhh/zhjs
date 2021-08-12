import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default [
  {
    input: 'src/main.ts',
    output: {
      name: 'zhjs',
      file: 'dist/zhjs.es.js',
      format: 'es'
    },
    plugins: [
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            target: 'es2015'
          }
        }
      }),
      nodeResolve()
      // terser()
    ]
  },
  {
    input: 'src/main.ts',
    output: {
      name: 'zhjs',
      file: 'dist/zhjs.umd.js',
      format: 'umd'
    },
    plugins: [
      typescript({
        useTsconfigDeclarationDir: true
      }),
      nodeResolve(),
      terser(),
    ]
  },
  {
    input: 'src/main.ts',
    output: {
      name: 'zhjs',
      file: 'dist/zhjs.iife.js',
      format: 'iife'
    },
    plugins: [
      typescript({
        useTsconfigDeclarationDir: true
      }),
      nodeResolve(),
      terser()
    ]
  }
]
