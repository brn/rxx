/**
 * @fileoverview
 * @author Taketoshi Aono
 */


'use strict';

const glob = require('glob');
const path = require('path');
const _ = require('lodash');


module.exports = config => {
  const webpack = _.clone(require('./webpack.dev.config'));
  delete webpack.entry;
  delete webpack.output;

  config.set({
    plugins: [
      "karma-mocha",
      "karma-chrome-launcher",
      "karma-phantomjs-launcher",
      "karma-source-map-support",
      'karma-sourcemap-loader',
      "karma-mocha-reporter",
      "karma-webpack"
    ],
    frameworks: ["mocha", "source-map-support"],
    files: [
      {pattern: './dll/vendor.development.dll.js'},
      {pattern: './src/**/__tests__/**/*.spec.ts*', watched: false}
    ],
    reporters: ["mocha"],
    mochaReporter: {
      showDiff: true
    },
    usePolling: false,
    preprocessors: {
      './src/**/__tests__/**/*.spec.ts*': ['webpack', 'sourcemap']
    },
    mime: {
      'text/x-typescript': ['ts','tsx']
    },
    browserNoActivityTimeout: 15000,
    webpack,
    webpackMiddleware: {
      hot: false,
      stats: {colors: true}
    }
  });
};
