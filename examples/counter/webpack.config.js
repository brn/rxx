/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    main: "./src/index.tsx"
  },
  output: {
    filename: "./lib/[name].js"
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  devtool: "inline-source-map",
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.ProvidePlugin({
      'Promise': 'es6-promise',
      'Symbol': 'es6-symbol',
      'fetch': 'imports-loader?this=>global!exports-loader?window.fetch!whatwg-fetch',
      'Response': 'imports-loader?this=>global!exports-loader?window.Response!whatwg-fetch'
    })
  ],
  module: {
    loaders: [ // loaders will work with webpack 1 or 2; but will be renamed "rules" in future
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: ['awesome-typescript-loader'], exclude: /node_modules/ }
    ]
  }
};
