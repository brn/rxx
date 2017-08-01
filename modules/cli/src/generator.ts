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
import { execSync } from 'child_process';
import {
  LanguageType
} from './options';
import {
  GeneratorRequirements
} from './types';


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
  'es6-symbol'
].join(' ');

const DEV_DEPENDENCIES = [
  'webpack',
  'lodash',
  'imports-loader',
  'exports-loader',
  'awesome-typescript-loader',
  'karma',
  'glob',
  'chai',
  'karma-mocha',
  'karma-chrome-launcher',
  'karma-source-map-support',
  'karma-sourcemap-loader',
  'karma-mocha-reporter',
  'karma-webpack',
  'webpack-dev-server'
].join(' ');

const TYPES = [
  '@types/react',
  '@types/react-dom',
  '@types/prop-types',
  '@types/chai',
  '@types/mocha'
].join(' ');

const DEV_TYPES = [
  '@types/chai',
  '@types/mocha'
].join(' ');

function converNameToValidJSClassNamePrefix(appName: string): string {
  const baseName = `${appName[0].toUpperCase()}${appName.slice(1)}`;

  return baseName
    .replace(/(?:_+|-+)([a-zA-Z])/g, (_, $1) => $1.toUpperCase());
}

export class Generator {
  private pkg: string = fs.readFileSync(path.join(TEMPLATE_DIR, 'package.json.template'), 'utf8');

  private templateGenerator: TemplateGenerator;

  private appName: string;

  private additionalModules: string[];

  private language: LanguageType;

  private license: string;

  private author: string;

  constructor({ appName, additionalModules, language, license, author }: GeneratorRequirements) {
    this.appName = appName;
    this.additionalModules = additionalModules;
    this.language = language;
    this.license = license;
    this.author = author;
    const prefix = converNameToValidJSClassNamePrefix(this.appName);
    this.templateGenerator = language === LanguageType.TS ?
      new TypescriptTemplateGenerator(prefix) : new JSTemplateGenerator(prefix);
  }


  public generate() {
    this.initDependencies();
    this.deployWebpackConfigs();
    this.deployKarmaConfig();
    this.templateGenerator.generate();
  }


  private initDependencies() {
    const pkg = ejs.render(this.pkg, this);
    fs.writeFileSync('package.json', pkg);
    try {
      execSync(`npm install ${DEPENDENCIES} ${this.language === LanguageType.TS ? TYPES : ''}`, { stdio });
      execSync(`npm install ${DEV_DEPENDENCIES} ${this.language === LanguageType.TS ? DEV_TYPES : ''} -D`, { stdio });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }


  private deployWebpackConfigs() {
    ['webpack.config.js', 'webpack.dev.config.js', 'webpack.dll.config.js', 'webpack.dll.dev.config.js'].forEach(name => {
      const conf = fs.readFileSync(`${TEMPLATE_DIR}/${name}.template`, 'utf8');
      fs.writeFileSync(name, conf);
    });
  }

  private deployKarmaConfig() {
    const conf = fs.readFileSync(`${TEMPLATE_DIR}/karma.conf.js.template`, 'utf8');
    fs.writeFileSync('karma.conf.js', conf);
  }
}


interface TemplateGenerator {
  generate(): void;
}


abstract class AbstractTemplateGenerator implements TemplateGenerator {
  public abstract generate();

  protected mkdir(dirName: string) {
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
}


class TypescriptTemplateGenerator extends AbstractTemplateGenerator {
  constructor(private classNamePrefix: string) { super(); }

  private static STORE_DIR = 'src/stores';

  private static INTENT_DIR = 'src/intents';

  private static VIEW_DIR = 'src/views';


  public generate() {
    this.mkdir('src');
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
    this.mkdir(dir);
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
    this.mkdir(dir);
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
    this.mkdir(dir);
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
    this.mkdir(`${dir}/__tests__`);
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


class JSTemplateGenerator extends AbstractTemplateGenerator {
  private static STORE_DIR = 'lib/stores';

  private static INTENT_DIR = 'lib/intents';

  private static VIEW_DIR = 'lib/views';


  constructor(private classNamePrefix: string) { super(); }


  public generate() {
    this.mkdir('lib');
    this.deployIndex();
    this.deployStore();
    this.deployIntent();
    this.deployView();
  }


  private deployIndex() {
    const index = ejs.render(fs.readFileSync(`${TEMPLATE_DIR}/index.jsx.template`, 'utf8'), this);
    const targetPath = 'src/index.jsx';
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
    this.mkdir(dir);
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
    this.mkdir(dir);
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
    this.mkdir(dir);
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
}
