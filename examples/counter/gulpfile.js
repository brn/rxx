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


gulp.task('default', ['serve']);
