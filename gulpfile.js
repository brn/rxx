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
const esdoc        = require('gulp-esdoc');
const typedoc      = require('gulp-typedoc');
const exec         = require('child_process').execSync;


const DIST = 'dist/';
const TYPESCRIPT_DIST = `${process.cwd()}/lib`;
const BIN_DIR = path.resolve(process.cwd(), './node_modules/.bin/') + '/';


gulp.task('publish-all', () => {
  glob.sync('./modules/*').forEach((dir, done) => {
    exec(`cd ${dir} && npm publish`);
  });
});


/**
 * Install dependencies.
 */
gulp.task('install', done => {
  exec(`${BIN_DIR}jspm install`);
});


gulp.task('clean', () => {
  try {fs.removeSync('./lib');} catch(e) {}
  try {fs.removeSync('./api-docs');} catch(e) {}
});


gulp.task('docs', () => {
  return gulp
    .src(["src/**/*.ts*", '!src/**/__tests__/**/*'])
    .pipe(typedoc(_.assign(JSON.parse(fs.readFileSync('./tsconfig.json')).compilerOptions, {

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


gulp.task('typescript-cjs', () => {
  const tsp = tsc.createProject('tsconfig.json', {
    module: 'commonjs',
    typescript: require('typescript'),
    declaration: true
  });
  const tsResult = gulp.src(['src/*', 'src/**/*', '!src/typings/main.d.ts', '!src/typings/main/**/*', '!src/**/__tests__/**', '!src/testing/**/*'])
          .pipe(tsp());
  return merge([
    tsResult.js.pipe(gulp.dest(`${TYPESCRIPT_DIST}/cjs`)),
    tsResult.dts.pipe(gulp.dest(`${TYPESCRIPT_DIST}/cjs`)),
  ]);
});


gulp.task('typescript-es2015', () => {
  const tsp = tsc.createProject('tsconfig.json', {
    module: 'es2015',
    target: 'ES5',
    typescript: require('typescript'),
    declaration: true
  });
  const tsResult = gulp.src(['src/*', 'src/**/*', '!src/typings/main.d.ts', '!src/typings/main/**/*', '!src/**/__tests__/**', '!src/testing/**/*'])
          .pipe(tsp());
  return merge([
    tsResult.js.pipe(gulp.dest(`${TYPESCRIPT_DIST}/es2015`)),
    tsResult.dts.pipe(gulp.dest(`${TYPESCRIPT_DIST}/es2015`)),
  ]);
});


gulp.task('publish', ['pre-publish'], () => {
  exec('cd lib && npm publish --access public');
});


gulp.task('update-core', ()=> {
  exec(`cd ${__dirname}/modules/http && jspm install @react-mvi/core=npm:@react-mvi/core --peer -y && npm install @react-mvi/core --save`);
  exec(`cd ${__dirname}/modules/event && jspm install @react-mvi/core=npm:@react-mvi/core --peer -y && npm install @react-mvi/core --save`);
});


gulp.task('update-core-and-publish', () => {
  exec(`cd ${__dirname}/modules/http && jspm install @react-mvi/core=npm:@react-mvi/core --peer -y && npm install @react-mvi/core --save && npm run-script patch-and-publish`);
  exec(`cd ${__dirname}/modules/event && jspm install @react-mvi/core=npm:@react-mvi/core --peer -y && npm install @react-mvi/core --save && npm run-script patch-and-publish`);
});


gulp.task('check-releasable', ['typescript', 'typescript-cjs', 'typescript-es2015'], runKarma.bind(null, true, 'PhantomJS'));


gulp.task('pre-publish', ['check-releasable'], () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const version = semver.inc(pkg.version, 'patch');

  glob.sync('./src/*').forEach(file => fs.copySync(file, `./lib/${file.replace('src', '')}`));
  pkg.version = version;
  pkg.main = 'index.js';
  pkg.jspm.jspmNodeConversion = false;
  pkg.jspm.main = 'index.js';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, "  "));
  fs.copySync('./package.json', './lib/package.json');
  fs.copySync('./node_modules', './lib/node_modules');
  try {
    fs.copySync('../../README.md', './lib/README.md');
    fs.copySync('../../docs', './lib/docs');
  } catch(e) {
    console.log(e);
  }
  fs.remove('lib/_references.d.ts');
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
