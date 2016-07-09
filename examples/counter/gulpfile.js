/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const _                  = require('lodash');
const fs                 = require('fs');
const gulp               = require('gulp');
const path               = require('path');
const childProcess       = require('child_process');
const tsc                = require('gulp-typescript');
const del                = require('del');
const express            = require('express');
const serveStatic        = require('serve-static');
const bodyParser         = require('body-parser');


const DIST = 'app';
const BIN_DIR = path.resolve(process.cwd(), './node_modules/.bin/') + '/';


const exec = (cmd, cb) => {
  var proc = childProcess.exec(cmd);
  proc.stdout.on('data', d => process.stdout.write(d));
  proc.stderr.on('data', d => process.stdout.write(d));
  proc.on('error', d => process.stdout.write(d));
  cb && proc.on('exit', cb);
};


gulp.task('serve', done => {
  const app = express();
  const serve = serveStatic('./');
  app.use(serve);
  app.use(bodyParser.json());
  app.post('/count', (req, res) => {
    res.send(req.body);
  });
  app.listen(8989);
});



/**
 * 各種のインストールを行う
 */
gulp.task('install', done => {
  exec(`${BIN_DIR}jspm install`, () => {
    process.chdir('src');
    if (!fs.existsSync('typings')) {
      exec(`${BIN_DIR}typings install`, done);
    }
  });
});


gulp.task('default', ['serve']);
