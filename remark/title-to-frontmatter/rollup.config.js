import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import pkg from './package.json' assert { type: 'json' }

export default {
  input: 'lib/index.js',
  output: [
    {
      file: `dist/${pkg.name}.cjs`,
      format: 'cjs',
    },
    {
      file: `dist/${pkg.name}.esm.js`,
      format: 'esm',
    },
  ],
  plugins: [
    nodeResolve({ preferBuiltins: false }), // or `true`
    commonjs(),
  ],
}
