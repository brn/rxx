/**
 * @fileoverview
 * @author Taketoshi Aono
 */


'use strict';

const glob = require('glob');
const path = require('path');
const _ = require('lodash');


module.exports = () => {
  const config = _.clone(require('./webpack.dev.config'));
  config.entry = _.clone(config.entry);
  glob.sync('./src/**/__tests__/**/*.spec.ts*').forEach(spec => {
    config.entry[path.basename(spec)] = spec;
  });
  delete config.entry;
  delete config.output;

  return {
    "plugins": [
      "karma-mocha",
      "karma-chrome-launcher",
      "karma-phantomjs-launcher",
      "karma-source-map-support",
      'karma-sourcemap-loader',
      "karma-mocha-reporter",
      "karma-webpack"
    ],
    "frameworks": ["mocha", "source-map-support"],
    "files": [
      {pattern: './src/**/__tests__/**/*.spec.ts*', watched: false}
    ],
    mime: {
      'text/x-typescript': ['ts','tsx']
    },
    "reporters": ["mocha"],
    "mochaReporter": {
      "showDiff": true
    },
    "usePolling": false,
    preprocessors: {
      './src/**/__tests__/**/*.spec.ts*': ['webpack', 'sourcemap']
    },
    browserNoActivityTimeout: 15000,
    webpack: config,
    webpackMiddleware: {
      hot: false,
      stats: {colors: true}
    }
  };
};
