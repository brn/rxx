/**
 * @fileoverview
 * @author Taketoshi Aono
 */


import config from './rollup.config.js';
import ts from 'rollup-plugin-ts';
const opt = JSON.parse(require('fs').readFileSync(`./tsconfig.json`, 'utf8'));

opt.compilerOptions.target = 'ES6';
config.format = 'es';
config.plugins.shift();
config.plugins.unshift(ts({
  typescript: require('typescript'),
  tsconfig: opt.compilerOptions
}));
config.plugins.pop(); // Uglify not support es6 modules.

export default config;
