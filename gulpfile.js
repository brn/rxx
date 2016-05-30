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

const _            = require('lodash');
const fs           = require('fs-extra');
const gulp         = require('gulp');
const path         = require('path');
const childProcess = require('child_process');
const tsc          = require('gulp-typescript');
const build        = require('./plugins/build');
const del          = require('del');
const karma        = require('karma');
const merge        = require('merge2');
const dtsGen       = require('dts-generator');
const glob         = require('glob');
const async        = require('async');
const findup       = require('findup');
const semver       = require('semver');
const npm          = require('npm');


const DIST = 'dist/';
const TYPESCRIPT_DIST = `${process.cwd()}/lib`;
const BIN_DIR = path.resolve(process.cwd(), './node_modules/.bin/') + '/';


const exec = (cmd, cb) => {
  var proc = childProcess.exec(cmd);
  proc.stdout.on('data', d => process.stdout.write(d));
  proc.stderr.on('data', d => process.stdout.write(d));
  proc.on('error', d => process.stdout.write(d));
  cb && proc.on('exit', cb);
};


gulp.task('publish-all', () => {
  async.forEachSeries(glob.sync('./modules/*'), (dir, done) => {
    exec(`cd ${dir} && npm publish`, done);
  });
});


/**
 * Install dependencies.
 */
gulp.task('install', done => {
  exec(`${BIN_DIR}jspm install`, () => {
    process.chdir('ts');
    exec(`${BIN_DIR}typings install`, done);
  });
});


gulp.task('clean', () => {
  try {
    fs.removeSync('./lib');
  } catch(e) {}
});


/**
 * Compile typescript.
 */
gulp.task('typescript', ['clean'], () => {
  const tsResult = gulp.src(['src/**/*', '!src/typings/main.d.ts', '!src/typings/main/**/*', '!src/**/__tests__/**', '!src/testing/**/*'])
    .pipe(tsc(_.assign(JSON.parse(fs.readFileSync('./tsconfig.json')).compilerOptions, {
      typescript: require('typescript'),
      declaration: true
    })));
  return merge([
    tsResult.js.pipe(gulp.dest(TYPESCRIPT_DIST)),
    tsResult.dts.pipe(gulp.dest(TYPESCRIPT_DIST)),
  ]);
});


gulp.task('publish', ['pre-publish'], done => {
  exec('cd lib && npm publish --access public', done);
});

gulp.task('update-core', done => {
  exec(`cd ${__dirname}/modules/http && jspm install npm:@react-mvi/core --peer && npm install @react-mvi/core --save`, () => {
    exec(`cd ${__dirname}/modules/event && jspm install npm:@react-mvi/core --peer && npm install @react-mvi/core --save`, done);
  });
});


gulp.task('update-core-and-publish', done => {
  exec(`cd ${__dirname}/modules/http && jspm install npm:@react-mvi/core --peer && npm install @react-mvi/core --save && npm run-script patch-and-publish`, () => {
    exec(`cd ${__dirname}/modules/event && jspm install npm:@react-mvi/core --peer && npm install @react-mvi/core --save && npm run-script patch-and-publish`, done);
  });
});


gulp.task('check-releasable', ['typescript'], runKarma.bind(null, true, 'PhantomJS'));


gulp.task('pre-publish', ['check-releasable'], () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const version = semver.inc(pkg.version, 'prerelease', 'beta');

  glob.sync('./src/*').forEach(file => fs.copySync(file, `./lib/${file.replace('src', '')}`));
  pkg.version = version;
  pkg.main = 'index.js';
  pkg.jspm.jspmNodeConversion = false;
  pkg.jspm.main = 'index.js';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, "  "));
  fs.copySync('./package.json', './lib/package.json');
  fs.copySync('./node_modules', './lib/node_modules');
  fs.remove('lib/_references.d.ts');
  try {
    fs.remove('lib/typings');
  } catch(e) {}
  try {
    fs.remove('lib/typings.json');
  } catch(e) {}
});


/**
 * Minify javascript
 */
gulp.task('minify', ['typescript'], () => {
  return gulp.src(`${process.cwd()}/lib/index.js`)
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
    .pipe(gulp.dest(`${process.cwd()}/dist/`));
});


/**
 * Delete temporary file.
 */
gulp.task('clean', (cb) => del([DIST, 'lib'], cb));


const KARMA_PID = '.karma.pid';
const KARMA_CONF = require('./karma.conf')();


function doRunKarma(singleRun, browser, done) {
  return new karma.Server(_.assign(KARMA_CONF, {
    browsers: [browser],
    singleRun: singleRun
  }), done).start();
};


function runKarma(singleRun, browser, done) {
  if (!singleRun) {
    doRunKarma(false, browser, done);
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
gulp.task('default', ['pre-publish']);
