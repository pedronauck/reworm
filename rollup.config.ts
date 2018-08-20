import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'

// tslint:disable
const pkg = require('./package.json')
const libraryName = 'reworm'

const globals = {
  react: 'React',
  'react-dom': 'ReactDom',
}

export default {
  input: `src/${libraryName}.tsx`,
  output: [
    {
      globals,
      file: pkg.main,
      name: libraryName,
      format: 'umd',
      sourcemap: true,
    },
    {
      globals,
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
  external: ['react', 'react-dom', 'prop-types'],
  watch: {
    include: 'src/**',
  },
  plugins: [
    json(),
    typescript({ useTsconfigDeclarationDir: true }),
    commonjs(),
    resolve(),
    sourceMaps(),
  ],
}
