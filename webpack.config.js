/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    main: "./src/main"
  },
  output: {
    filename: "[name].js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", '.json']
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  ],
  module: {
    rules: [ // loaders will work with webpack 1 or 2; but will be renamed "rules" in future
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: ['awesome-typescript-loader'], exclude: /node_modules/ }
    ]
  }
};
