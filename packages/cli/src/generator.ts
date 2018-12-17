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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 *  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview 
 * @author Taketoshi Aono
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import {
  LanguageType
} from './options';
import {
  GeneratorRequirements,
  Git
} from './types';
import {
  PackageManagerName,
  PackageManagerFactory,
  PackageManager,
  PackageInstallType
} from './package-manager';
import {
  Process
} from './process';


type JSON = { [key: string]: any };
const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');
/*tslint:disable:no-magic-numbers*/
const stdio = [0, 1, 2];
/*tslint:enable:no-magic-numbers*/

const DEPENDENCIES = [
  '@react-mvi/core',
  '@react-mvi/http',
  '@react-mvi/testing',
  'react',
  'react-dom',
  'prop-types',
  'rxjs',
  'tslib',
  'es6-promise',
  'es6-symbol',
  'whatwg-fetch'
];

const DEV_DEPENDENCIES = [
  'webpack',
  'lodash',
  'imports-loader',
  'exports-loader',
  'awesome-typescript-loader',
  'karma',
  'glob',
  'chai',
  'mocha',
  'karma-mocha',
  'karma-chrome-launcher',
  'karma-source-map-support',
  'karma-sourcemap-loader',
  'karma-mocha-reporter',
  'karma-webpack',
  'webpack-dev-middleware',
  'webpack-hot-middleware',
  'sw-precache-webpack-plugin',
  'express',
  'serve-static',
  'npm-run-all',
  'rimraf'
];

const JS_DEV_DEPENDENCIES = [
  'babel-loader',
  'babel-core',
  'babel-preset-env',
  'babel-preset-react',
  'babel-plugin-transform-decorators-legacy'
];

const TYPES = [
  '@types/react',
  '@types/react-dom',
  '@types/prop-types',
  '@types/chai',
  '@types/mocha',
  '@types/chai',
  '@types/mocha'
];

function converNameToValidJSClassNamePrefix(appName: string): string {
  const baseName = `${appName[0].toUpperCase()}${appName.slice(1)}`;

  return baseName
    .replace(/(?:_+|-+)([a-zA-Z])/g, (_, $1) => $1.toUpperCase());
}

function mkdir(dirName: string) {
  try {
    fs.mkdirSync(dirName);
  } catch (e) {
    if (fs.existsSync(dirName)) {
      return;
    }
    console.error(e);
    process.exit(1);
  }
}

export class Generator {
  private pkg: string = fs.readFileSync(path.join(TEMPLATE_DIR, 'package.json.template'), 'utf8');

  private templateGenerator: TemplateGenerator;

  private appName: string;

  private additionalModules: string[];

  private language: LanguageType;

  private license: string;

  private author: string;

  private packageManager: PackageManager;

  private git: Git;

  private installTypings: boolean;

  private isPrivate: boolean;

  constructor({
    appName,
    additionalModules,
    language,
    license,
    author,
    packageManager,
    git,
    installTypings,
    isPrivate
  }: GeneratorRequirements) {
    this.appName = appName;
    this.additionalModules = additionalModules;
    this.language = language;
    this.license = license;
    this.author = author;
    this.packageManager = PackageManagerFactory.create(packageManager);
    this.git = git;
    this.installTypings = installTypings;
    this.isPrivate = isPrivate;
    const prefix = converNameToValidJSClassNamePrefix(this.appName);
    this.templateGenerator = language === LanguageType.TS ?
      new TypescriptTemplateGenerator(prefix) : new JSTemplateGenerator(prefix);
  }


  public async generate() {
    await this.initGit();
    this.initPakcageJSON();
    await this.initDependencies();
    this.deployWebpackConfigs();
    this.deployKarmaConfig();
    this.deployCerts();
    this.deployServer();
    this.templateGenerator.generate();
  }


  public migrate({ replaceWebpack }: { replaceWebpack: boolean }) {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    pkg.rmvi = {
      language: LanguageType[this.language].toLowerCase(),
      additionalModules: [],
      packageManager: this.packageManager.name,
      installTypings: this.installTypings,
      migrated: !replaceWebpack
    };
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, '  '));

    this.initDependencies(replaceWebpack);

    if (replaceWebpack) {
      this.renameWebpackConfig();
      this.deployWebpackConfigs();
    }
  }


  private async initGit() {
    if (this.git.use) {
      try {
        await Process.run('git', ['init']);
      } catch (e) { console.error(e); }
      if (this.git.remote) {
        try {
          await Process.run('git', ['remote', 'add', 'origin', this.git.remote]);
        } catch (e) { console.error(e); }
      }
    }
  }


  private initPakcageJSON() {
    const pkg = ejs.render(this.pkg, this);
    fs.writeFileSync('package.json', pkg);
  }


  private async initDependencies(installDevDependencies = true) {
    try {
      await this.packageManager.install(DEPENDENCIES);
      if (installDevDependencies) {
        await this.packageManager.install(
          DEV_DEPENDENCIES.concat(this.language === LanguageType.TS ? TYPES : JS_DEV_DEPENDENCIES),
          PackageInstallType.DEV);
      }
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }


  private renameWebpackConfig() {
    try {
      const conf = fs.readFileSync('./webpack.config.js', 'utf8');
      fs.writeFileSync('./webpack.config.js.orig', conf);
    } catch (e) { }
    try {
      const conf = fs.readFileSync('./webpack.dll.config.js', 'utf8');
      fs.writeFileSync('./webpack.dll.config.js.orig', conf);
    } catch (e) { }
  }


  private deployWebpackConfigs() {
    ['webpack.config.js', 'webpack.dll.config.js', 'index.html'].forEach(name => {
      const conf = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/${name}.template`, 'utf8'), this);
      fs.writeFileSync(name, conf);
    });
  }


  private deployCerts() {
    mkdir('./certs');
    ['server.key', 'server.crt'].forEach(name => {
      const conf = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/certs/${name}`, 'utf8'), this);
      fs.writeFileSync(`./certs/${name}`, conf);
    });
  }


  private deployServer() {
    const conf = fs.readFileSync(`${TEMPLATE_DIR}/server.js.template`, 'utf8');
    fs.writeFileSync('server.js', conf);
  }


  private deployKarmaConfig() {
    const conf = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/karma.conf.js.template`, 'utf8'), this);
    fs.writeFileSync('karma.conf.js', conf);
  }
}


interface TemplateGenerator {
  generate(): void;
}


class TypescriptTemplateGenerator implements TemplateGenerator {
  constructor(private classNamePrefix: string) { }

  private static STORE_DIR = 'src/stores';

  private static INTENT_DIR = 'src/intents';

  private static VIEW_DIR = 'src/views';


  public generate() {
    mkdir('src');
    this.deployIndex();
    this.deployStore();
    this.deployTest();
    this.deployIntent();
    this.deployView();
    this.deployTSConfig();
  }


  private deployIndex() {
    const index = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/index.tsx.template`, 'utf8'), this);
    const targetPath = 'src/index.tsx';
    if (fs.existsSync(targetPath)) {
      console.info(`${targetPath} is already exists. Skip.`);
    }
    try {
      fs.writeFileSync(targetPath, index);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }


  private deployStore() {
    const dir = TypescriptTemplateGenerator.STORE_DIR;
    mkdir(dir);
    const store = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/store.ts.template`, 'utf8'), this);
    const targetPath = `${dir}/store.ts`;
    if (fs.existsSync(targetPath)) {
      return console.info(`${targetPath} is already exists. Skip.`);
    }
    try {
      fs.writeFileSync(targetPath, store);
    } catch (e) {
      console.error(e); process.exit(1);
    }
  }


  private deployIntent() {
    const dir = TypescriptTemplateGenerator.INTENT_DIR;
    mkdir(dir);
    const intent = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/intent.ts.template`, 'utf8'), this);
    const targetPath = `${dir}/intent.ts`;
    if (fs.existsSync(targetPath)) {
      return console.info(`${targetPath} is already exists. Skip.`);
    }
    try {
      fs.writeFileSync(targetPath, intent);
    } catch (e) {
      console.error(e); process.exit(1);
    }
  }


  private deployView() {
    const dir = TypescriptTemplateGenerator.VIEW_DIR;
    mkdir(dir);
    const view = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/component.tsx.template`, 'utf8'), this);
    const targetPath = `${dir}/app.tsx`;
    if (fs.existsSync(targetPath)) {
      return console.info(`${targetPath} is already exists. Skip.`);
    }
    try {
      fs.writeFileSync(targetPath, view);
    } catch (e) { console.error(e); process.exit(1); }
  }

  private deployTSConfig() {
    const tsconfig = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/tsconfig.json.template`, 'utf8'), this);
    const targetPath = './tsconfig.json';
    if (fs.existsSync(targetPath)) {
      return console.info(`${targetPath} is already exists. Skip.`);
    }
    try {
      fs.writeFileSync(targetPath, tsconfig);
    } catch (e) {
      console.error(e); process.exit(1);
    }
  }

  private deployTest() {
    const dir = TypescriptTemplateGenerator.STORE_DIR;
    mkdir(`${dir}/__tests__`);
    const spec = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/store.spec.ts.template`, 'utf8'), this);
    const targetPath = `${dir}/__tests__/store.spec.ts`;
    if (fs.existsSync(targetPath)) {
      return console.info(`${targetPath} is already exists. Skip.`);
    }
    try {
      fs.writeFileSync(targetPath, spec);
    } catch (e) {
      console.error(e); process.exit(1);
    }
  }
}


class JSTemplateGenerator implements TemplateGenerator {
  private static STORE_DIR = 'lib/stores';

  private static INTENT_DIR = 'lib/intents';

  private static VIEW_DIR = 'lib/views';


  constructor(private classNamePrefix: string) { }


  public generate() {
    mkdir('lib');
    this.deployIndex();
    this.deployStore();
    this.deployIntent();
    this.deployView();
    this.deployTest();
  }


  private deployIndex() {
    const index = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/index.jsx.template`, 'utf8'), this);
    const targetPath = 'lib/index.jsx';
    if (fs.existsSync(targetPath)) {
      return console.info(`${targetPath} is already exists. Skip.`);
    }
    try {
      fs.writeFileSync(targetPath, index);
    } catch (e) {
      console.error(e); process.exit(1);
    }
  }


  private deployStore() {
    const dir = JSTemplateGenerator.STORE_DIR;
    mkdir(dir);
    const store = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/store.js.template`, 'utf8'), this);
    const targetPath = `${dir}/store.js`;
    if (fs.existsSync(targetPath)) {
      return console.info(`${targetPath} is already exists. Skip.`);
    }
    try {
      fs.writeFileSync(targetPath, store);
    } catch (e) {
      console.error(e); process.exit(1);
    }
  }


  private deployIntent() {
    const dir = JSTemplateGenerator.INTENT_DIR;
    mkdir(dir);
    const intent = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/intent.js.template`, 'utf8'), this);
    const targetPath = `${dir}/intent.js`;
    if (fs.existsSync(targetPath)) {
      return console.info(`${targetPath} is already exists. Skip.`);
    }
    try {
      fs.writeFileSync(targetPath, intent);
    } catch (e) {
      console.error(e); process.exit(1);
    }
  }


  private deployView() {
    const dir = JSTemplateGenerator.VIEW_DIR;
    mkdir(dir);
    const view = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/component.jsx.template`, 'utf8'), this);
    const targetPath = `${dir}/app.jsx`;
    if (fs.existsSync(targetPath)) {
      return console.info(`${targetPath} is already exists. Skip.`);
    }
    try {
      fs.writeFileSync(targetPath, view);
    } catch (e) {
      console.error(e); process.exit(1);
    }
  }


  private deployTest() {
    const dir = JSTemplateGenerator.STORE_DIR;
    mkdir(`${dir}/__tests__`);
    const spec = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/store.spec.js.template`, 'utf8'), this);
    const targetPath = `${dir}/__tests__/store.spec.js`;
    if (fs.existsSync(targetPath)) {
      return console.info(`${targetPath} is already exists. Skip.`);
    }
    try {
      fs.writeFileSync(targetPath, spec);
    } catch (e) {
      console.error(e); process.exit(1);
    }
  }
}
