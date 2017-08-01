/**
 * @fileoverview Webpack config template.
 */

const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const REACT_MVI_BASE_PATH = path.join(__dirname, "node_modules", "@react-mvi");
const _  = require('lodash');

function enhanceConfigForDevelopment(baseConfig) {
  const config = _.clone(require('./webpack.dll.config.js'));
  config.entry = _.clone(config.entry);
  config.output = _.clone(config.output);
  config.plugins = config.plugins.slice();
  config.entry['vendor.development'] = config.entry['vendor.production'];
  delete config.entry['vendor.production'];
  
  config.devtool = "inline-source-map";
  config.plugins.pop();
  config.plugins.pop();
  config.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': '"debug"'
  }));
  return config;
}


module.exports = enhanceConfigForDevelopment(require('./webpack.dll.config'));
