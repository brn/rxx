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
const tsc          = require('gulp-typescript');
const del          = require('del');
const karma        = require('karma');
const merge        = require('merge2');
const glob         = require('glob');
const async        = require('async');
const findup       = require('findup');
const semver       = require('semver');
const npm          = require('npm');
const esdoc        = require('gulp-esdoc');
const typedoc      = require('gulp-typedoc');
const exec         = require('child_process').execSync;


const DIST = 'dist/';
const TYPESCRIPT_DIST = `${process.cwd()}/lib`;
const BIN_DIR = path.resolve(process.cwd(), './node_modules/.bin/') + '/';


gulp.task('publish-all', () => {
  glob.sync('./modules/*').forEach((dir, done) => {
    exec(`cd ${dir} && npm publish`, {stdio: [0,1,2]});
  });
});


gulp.task('clean', () => {
  try {fs.removeSync('./lib');} catch(e) {}
  try {fs.removeSync('./api-docs');} catch(e) {}
});


gulp.task('docs', () => {
  const options = JSON.parse(fs.readFileSync('./tsconfig.json')).compilerOptions;
  delete options.lib;
  options.target = process.cwd().indexOf('http') > -1? 'ES5': 'ES6';
  return gulp
    .src(["src/*.ts*", "src/**/*.ts*", '!src/**/__tests__/**/*'])
    .pipe(typedoc(_.assign(options, {

      // Output options (see typedoc docs)
      out: "./api-docs",
      json: "api-docs/json/docs.json",

      // TypeDoc options (see typedoc docs)
      name: "react-mvi",
      theme: "default",
//      plugins: ["my", "plugins"],
      ignoreCompilerErrors: false,
      version: true
    })));
});


/**
 * Compile typescript.
 */
gulp.task('typescript', ['clean'], () => {
  const tsp = tsc.createProject('tsconfig.json', {
    typescript: require('typescript'),
    declaration: true
  });
  const tsResult = gulp.src(['src/*', 'src/**/*', '!src/typings/main.d.ts', '!src/typings/main/**/*', '!src/**/__tests__/**', '!src/testing/**/*'])
          .pipe(tsp());

  return merge([
    tsResult.js.pipe(gulp.dest(TYPESCRIPT_DIST)),
    tsResult.dts.pipe(gulp.dest(TYPESCRIPT_DIST)),
  ]);
});


gulp.task('publish', ['pre-publish'], () => {
  exec('cd lib && npm publish --access public', {stdio: [0,1,2]});
});


gulp.task('publish-patch', ['pre-publish-with-patch'], () => {
  exec('cd lib && npm publish --access public', {stdio: [0,1,2]});
});

gulp.task('publish-major', ['pre-publish-with-major'], () => {
  exec('cd lib && npm publish --access public', {stdio: [0,1,2]});
});

gulp.task('publish-minor', ['pre-publish-with-minor'], () => {
  exec('cd lib && npm publish --access public', {stdio: [0,1,2]});
});


gulp.task('update-core', ()=> {
  exec(`cd ${__dirname}/modules/http && npm uninstall @react-mvi/core --save && npm install @react-mvi/core --peer --dev`, {stdio: [0,1,2]});
  exec(`cd ${__dirname}/modules/event && npm uninstall @react-mvi/core --save && npm install @react-mvi/core --peer --dev`, {stdio: [0,1,2]});
});


gulp.task('update-core-and-publish', () => {
  exec(`cd ${__dirname}/modules/http && npm uninstall @react-mvi/core --save && npm install @react-mvi/core --peer --dev && npm run-script patch-and-publish`, {stdio: [0,1,2]});
  exec(`cd ${__dirname}/modules/event && npm uninstall @react-mvi/core --save && npm install @react-mvi/core --peer --dev && npm run-script patch-and-publish`, {stdio: [0,1,2]});
});


gulp.task('check-releasable', ['typescript'], runKarma.bind(null, true, 'PhantomJS'));


gulp.task('pre-publish-with-patch', ['check-releasable'], () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  pkg.version = semver.inc(pkg.version, 'patch');
  doPrepublish(pkg);
});


gulp.task('pre-publish-with-major', ['check-releasable'], () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  pkg.version = semver.inc(pkg.version, 'major');
  doPrepublish(pkg);
});


gulp.task('pre-publish-with-minor', ['check-releasable'], () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  pkg.version = semver.inc(pkg.version, 'minor');
  doPrepublish(pkg);
});


gulp.task('pre-publish', ['check-releasable'], () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  doPrepublish(pkg);
});


function doPrepublish(pkg) {
  glob.sync('./src/*').filter(file => file.indexOf('__tests__') === -1).forEach(file => fs.copySync(file, `./lib/${file.replace('src', '')}`));
  pkg.main = 'index.js';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, "  "));
  fs.copySync('./package.json', './lib/package.json');
  try {
    fs.copySync('./node_modules', './lib/node_modules');
  } catch(e) {}
  try {
    fs.copySync('../../README.md', './lib/README.md');
    fs.copySync('../../docs', './lib/docs');
  } catch(e) {
    console.log(e);
  }
  fs.remove('lib/_references.d.ts');
}

const KARMA_PID = '.karma.pid';
const KARMA_CONF = require('./karma.conf')();


function doRunKarma(singleRun, browser, done) {
  return new karma.Server(_.assign(KARMA_CONF, {
    browsers: [browser],
    singleRun: singleRun
  }), done).start();
};


function runKarma(singleRun, browser, done) {
  if (require('glob').sync('./src/**/__tests__/*.spec.ts*').length) {
    if (!singleRun) {
      doRunKarma(false, browser, done);
    } else {
      doRunKarma(true, browser, done);
    }
  } else {
    done();
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
gulp.task('default', [ 'pre-publish']);
