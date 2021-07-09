import typescript from '@rollup/plugin-typescript'
import { terser } from "rollup-plugin-terser"

export default [
  {
    input: 'src/main.ts',
    output: {
      name: 'zhjs',
      file: 'dist/zhjs.umd.js',
      format: 'umd'
    },
    plugins: [typescript(), terser()],
  },
  {
    input: 'src/main.ts',
    output: {
      name: 'zhjs',
      file: 'dist/zhjs.iife.js',
      format: 'iife'
    },
    plugins: [typescript(), terser()],
  }
]
