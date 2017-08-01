/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const path = require('path');
const webpack = require('webpack');
const REACT_MVI_BASE_PATH = path.join(__dirname, "node_modules", "@react-mvi");

module.exports = {
  entry: {
    app: "./src/index"
  },
  output: {
    filename: "./dist/[name].js"
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.ProvidePlugin({
      'Promise': 'es6-promise',
      'Symbol': 'es6-symbol',
      'fetch': 'imports?this=>global!exports?global.fetch?window.fetch!whatwg-fetch',
      'Response': 'imports-loader?this=>global!exports-loader?global.Response!whatwg-fetch'
    }),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./dll/vendor.production-manifest.json')
    })
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, loader: ['awesome-typescript-loader'], exclude: /node_modules/ },
      { test: /\.dataurl$/, loader: 'raw-loader' }
    ]
  }
};
