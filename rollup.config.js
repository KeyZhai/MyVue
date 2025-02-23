import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
export default {
  input: './packages/vue/src/index.ts',
  output: [
    //1.cjs
    {
      format: 'cjs',
      file: 'packages/vue/dist/minivue.cjs.js',
    },
    //2.esm
    {
      format: 'es',
      file: 'packages/vue/dist/minivue.esm.js',
    },
  ],

  plugins: [
    typescript(),
    commonjs(),
    resolve({
      extensions: ['.js', '.ts']
    })
  ]
}