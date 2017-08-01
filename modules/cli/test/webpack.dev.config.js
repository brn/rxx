/**
 * @fileoverview Webpack config template.
 */

const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const REACT_MVI_BASE_PATH = path.join(__dirname, "node_modules", "@react-mvi");
const _  = require('lodash');

function enhanceConfigForDevelopment(baseConfig) {
  const conf = _.clone(baseConfig);
  const app = conf.entry.app;
  conf.entry = _.clone(conf.entry);
  conf.entry.app = [app, "webpack/hot/dev-server", "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true"];

  conf.output = _.clone(conf.output);
  conf.output.path = '/';
  conf.output.publicPath = 'http://localhost:8181/scripts/';

  conf.devtool = "inline-source-map";

  conf.plugins = [
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./dll/vendor.development-manifest.json')
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"debug"'
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ];

  return conf;
}


module.exports = enhanceConfigForDevelopment(require('./webpack.config'));
