/**
 * The MIT License (MIT)
 * Copyright (c) Taketoshi Aono
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview 
 * @author Taketoshi Aono
 */

const _                  = require('lodash');
const fs                 = require('fs');
const gulp               = require('gulp');
const path               = require('path');
const childProcess       = require('child_process');
const tsc                = require('gulp-typescript');
const build              = require('./plugins/build');
const del                = require('del');
const karma              = require('karma');


const DIST = 'dist/';
const BIN_DIR = path.resolve(process.cwd(), './node_modules/.bin/') + '/';

const exec = (cmd, cb) => {
  var proc = childProcess.exec(cmd);
  proc.stdout.on('data', d => process.stdout.write(d));
  proc.stderr.on('data', d => process.stdout.write(d));
  proc.on('error', d => process.stdout.write(d));
  cb && proc.on('exit', cb);
}



/**
 * Install dependencies.
 */
gulp.task('install', done => {
  exec(`${BIN_DIR}jspm install`, () => {
    process.chdir('ts');
    exec(`${BIN_DIR}typings install`, done);
  });
});


/**
 * Compile typescript.
 */
gulp.task('typescript', () => {  
  return gulp.src(['src/**/*', '!src/typings/main.d.ts', '!src/typings/main/**/*', '!src/**/__tests__/**', '!src/testing/**/*'])
    .pipe(tsc(_.assign(JSON.parse(fs.readFileSync('./src/tsconfig.json')).compilerOptions, {
      typescript: require('typescript')
    })))
    .pipe(gulp.dest('lib/'));
});


/**
 * Minify javascript
 */
gulp.task('minify', ['typescript'], () => {
  return gulp.src('lib/mvi.js')
    .pipe(build({
      configFile: "config.js",
      build: {
        minify: true,
        sourceMaps: false,
        mangle: false,
        globalDefs: {
          DEBUG: false
        }
      }
    }))
    .pipe(gulp.dest(`${DIST}/`));
});


/**
 * Delete temporary file.
 */
gulp.task('clean', (cb) => del([DIST, 'lib'], cb));


const KARMA_PID = '.karma.pid';


const KARMA_CONF = JSON.parse(fs.readFileSync('karma.conf.json', 'utf-8'));


const doRunKarma = (singleRun, browser, done) => {
  return new karma.Server(_.assign(KARMA_CONF, {
    browsers: [browser],
    singleRun: singleRun
  }), done).start();
};


const runKarma = (singleRun, browser, done) => {
  if (!singleRun) {
    try {
      fs.readFileSync(KARMA_PID);
      console.error('tdd already running.');
    } catch (e) {
      fs.writeFileSync(KARMA_PID, process.pid, 'utf8');
      doRunKarma(false, browser, done);
    }
  } else {
    doRunKarma(true, browser, done);
  }
};


/**
 * Launch karma
 */
gulp.task('test', runKarma.bind(null, true, 'PhantomJS'));


/**
 * Launch karma
 */
gulp.task('test-chrome', runKarma.bind(null, true, 'Chrome'));


/**
 * Launch karma
 */
gulp.task('tdd-chrome', runKarma.bind(null, false, 'Chrome'));


/**
 * Launch karma
 */
gulp.task('tdd-jsdom', runKarma.bind(null, false, 'jsdom'));


/**
 * Launch and watch karma
 */
gulp.task('tdd', runKarma.bind(null, false, 'PhantomJS'));


/**
 * Launch and watch karma
 */
gulp.task('test-debug', runKarma.bind(null, true, 'PhantomJS_debug'));


gulp.task('exit-tdd', () => {
  try {
    const pid = fs.readFileSync(KARMA_PID, 'utf8');
    try {
      process.kill(parseInt(pid, 10), 'SIGTERM');
    } catch(e) {}
    fs.unlinkSync(KARMA_PID);
  } catch(e) {
    console.error('tdd not yet running.');
  }
});


gulp.task('reload-tdd', ['exit-tdd', 'tdd']);

gulp.task('build', ['minify']);
gulp.task('default', ['build']);
