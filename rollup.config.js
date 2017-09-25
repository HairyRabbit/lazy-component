import startCase from 'lodash/startCase'
import babel     from 'rollup-plugin-babel'
import uglify    from 'rollup-plugin-uglify'
import pkg       from './package.json'

const input     = pkg.main
const name      = startCase(pkg.npmName).replace(/\s/g, '')
const format    = 'umd'
const sourcemap = true
const external = [
  'lodash',
  'react',
  'rabbit-promise-extra'
]
const globals = {
  'react': 'React',
  'lodash': 'lodash',
  'rabbit-promise-extra': 'PromiseExtra'
}

let output, plugins

if(process.env.NODE_ENV === 'development') {
  output = {
    file: 'dist/lazy-component.js',
    format,
    sourcemap
  }
  
  plugins = [
    babel()
  ]
} else {
  output = {
    file: 'dist/lazy-component.min.js',
    format,
    sourcemap
  }
  
  plugins = [
    babel(),
    uglify()
  ]
}

export default  {
  input,
  output,
  name,
  plugins,
  globals,
  external
}
