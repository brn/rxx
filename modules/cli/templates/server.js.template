/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const fs = require('fs');
const express = require('express');
const serveStatic = require('serve-static');
const https = require('https');
const http = require('http');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const _  = require('lodash');
const config = require('./webpack.config.js');
const serve = serveStatic('./');
const app = express();
config.output.path = '/';
const compiler = webpack(config);
let isProd = process.env.NODE_ENV === 'production';

const certOptions = {
  cert: fs.readFileSync('./certs/server.crt'),
  key: fs.readFileSync('./certs/server.key')
};

app.use(serve);
app.use(webpackDevMiddleware(compiler, {
  hot: true,
  inline: true,
  publicPath: config.output.publicPath,
  stats: {colors: true}
}));
app.use(webpackHotMiddleware(compiler, {
  path: '/__webpack_hmr',
  log: console.log,
  heartbeat: 10 * 1000
}));

app.get('/vendor.*.dll.js', (req, res) => {
  res.setHeader('content-type', 'application/javascript');
  res.send(fs.readFileSync(isProd? 'dll/vendor.production.dll.js': 'dll/vendor.development.dll.js', 'utf8'));
});

https.createServer(certOptions, app).listen(8181, () => {
  http.createServer(app).listen(8282, () => {
    console.log('SSLServer started 8181 port.\nHTTPServer started 8282 port.');
  });
});
