/**
 * @fileoverview
 * @author Taketoshi Aono
 */


const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    ['vendor.production']: [
      'es6-promise',
      'react',
      'react-dom',
      'rxjs',
      '@react-mvi/core',
      '@react-mvi/http',
      'es6-symbol',
      'tslib',
      'whatwg-fetch'
    ]
  },
  output: {
    filename: '[name].dll.js',
    path: `${__dirname}/dll`,
    library: 'vendor_library'
  },
  plugins: [
    new webpack.ProvidePlugin({
      'Promise': 'es6-promise',
      'Symbol': 'es6-symbol',
      'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch',
      'Response': 'imports-loader?this=>global!exports-loader?global.Response!whatwg-fetch'
    }),
    new webpack.DllPlugin({
      path: path.join(__dirname, 'dll', '[name]-manifest.json'),
      name: 'vendor_library'
    }),

    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  ]
};
