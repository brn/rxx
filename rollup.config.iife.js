/**
 * @fileoverview
 * @author Taketoshi Aono
 */


// rollup.config.js
import uglify from 'rollup-plugin-uglify';
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from 'rollup-plugin-commonjs';
import ts from 'rollup-plugin-ts';
const opt = require(`${process.cwd()}/tsconfig.json`);

const EXTERNALS = {'react': 'React', 'react-dom': 'ReactDOM', 'rxjs/Rx': 'Rx', 'prop-types': 'PropTypes', '@react-mvi/core': 'ReactMVI'};

const moduleName = process.cwd().match(/modules\/([^\/]+)/)[1];

export default {
  entry: './src/index.ts',
  moduleName: moduleName === 'core'? 'ReactMVI': `ReactMVI.${moduleName}`,
  format: 'iife',
  external: Object.keys(EXTERNALS),
  globals: EXTERNALS,
  plugins: [
    ts({
      typescript: require('typescript'),
      tsconfig: opt.compilerOptions
    }),
    nodeResolve(),
    commonjs(),
    uglify()
  ]
};
