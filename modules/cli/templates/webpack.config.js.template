/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const path = require('path');
const webpack = require('webpack');

const PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    app: "./src/index"
  },
  output: {
    path: PRODUCTION? `${__dirname}/dist`: '/',
    filename: "[name].js",
    publicPath: '/dist/'
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  devtool: PRODUCTION? 'inline-source-map': '',
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    ...(PRODUCTION? [
      new webpack.optimize.UglifyJsPlugin(),
    ]: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': PRODUCTION? '"production"': '"debug"'
    }),
    new webpack.ProvidePlugin({
      'Promise': 'es6-promise',
      'Symbol': 'es6-symbol',
      'fetch': 'imports?this=>global!exports?global.fetch?window.fetch!whatwg-fetch',
      'Response': 'imports-loader?this=>global!exports-loader?global.Response!whatwg-fetch'
    }),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: PRODUCTION? require('./dll/vendor.production-manifest.json'):
        require('./dll/vendor.development-manifest.json')
    })
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, loader: ['awesome-typescript-loader'], exclude: /node_modules/ }
    ]
  }
};
