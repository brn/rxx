/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const fs = require('fs');
const _  = require('lodash');

function enhanceConfigForDevelopment(baseConfig) {
  const conf = _.clone(baseConfig);
  const main = conf.entry.main;
  conf.entry = _.clone(conf.entry);
  conf.entry.main = [main, "webpack/hot/dev-server", "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true"];

  conf.output = _.clone(conf.output);
  conf.output.path = '/';
  conf.output.publicPath = 'https://localhost:8181/scripts/';

  conf.devtool = "inline-source-map";

  conf.plugins = [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.SourceMapDevToolPlugin({
      filename: null, // if no value is provided the sourcemap is inlined
      test: /\.(tsx?|js)($|\?)/i // process .js and .ts files only
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"debug"'
    })
  ];
  conf.module = _.cloneDeep(conf.module);
  conf.module.rules = [{
    test: /\.tsx?$/,
    loader: 'awesome-typescript-loader',
    query: {
      compilerOptions: {
        sourceMap: true
      }
    }
  }, {
    test: /\.json$/,
    loader: 'json-loader'
  }];

  return conf;
}


module.exports = enhanceConfigForDevelopment(require('./webpack.config'));
