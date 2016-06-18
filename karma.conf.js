/**
 * @fileoverview
 * @author Taketoshi Aono
 */


'use strict';

const findup = require('findup');


module.exports = () => {
  return {
    "plugins": [
      "karma-jspm",
      "karma-mocha",
      "karma-chrome-launcher",
      "karma-phantomjs-launcher",
      "karma-source-map-support",
      "karma-jsdom-launcher",
      "karma-mocha-reporter"
    ],
    "frameworks": ["jspm", "mocha", "source-map-support"],
    "files": [],
    "reporters": ["mocha"],
    "mochaReporter": {
      "showDiff": true
    },
    "usePolling": false,
    "customLaunchers": {
      "PhantomJS_debug": {
        "base": "PhantomJS",
        "options": {
          "windowName": "debug-window"
        },
        "debug": true
      }
    },
    "jspm": {
      config: "./jspm.config.js",
      browser: "./jspm.karma.js",
      packages: 'jspm_packages',
      loadFiles: ["src/**/__tests__/*.spec.ts*", "src/__tests__/*.spec.ts*"],
      serveFiles: [
        "node_modules/**/**.d.ts",
        "jspm_packages/**/*.js",
        "jspm_packages/**/*.ts*",
        "jspm_packages/**/*.json",
        "src/**/!(*.spec).ts*",
        "*.json"
      ]
    }
  };
};
