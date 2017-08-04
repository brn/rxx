#!/usr/bin/env node
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


import * as yargs from 'yargs';
import {
  Interaction,
  UserInputValidator,
  createDefaultOptions
} from '../interaction';
import {
  PackageManagerName
} from '../package-manager';
import {
  Generator
} from '../generator';
import {
  LanguageType
} from '../options';
import {
  PostInstalls
} from '../post-installs';
import {
  pkg,
  checkPkg
} from '../pkg';


export const command = 'new';
export const desc = 'Initialize react-mvi application with command line options.';
export const builder = yargs => {
  return yargs
    .option('name [name]', { alias: 'a', desc: 'Application name.' })
    .option('license [license]', { alias: 'l', desc: 'Application license' })
    .option('author [authoer]', { alias: 'a', desc: 'Application Author' })
    .option('pm [package-manager]', { alias: 'p', desc: 'Package manager one of [npm/yarn]' })
    .option('module [additional-modules...]', { alias: 'm', desc: 'Additional install modules (comma separeated list like "react,react-dom")' })
    .option('lang [language]', { alias: 'l', desc: 'Language one of [ts/js]' })
    .option('git [repository]', { alias: 'g', desc: 'Initialize git.' });
};


type Options = {
  name?: string;
  license?: string;
  author?: string;
  pm?: 'npm' | 'yarn';
  module?: string;
  lang?: 'ts' | 'js';
  git?: string;
};


function getOptions(argv: Options) {
  const result = createDefaultOptions();
  const { name, license, author, pm, module, lang, git }: Options = argv;

  result.license = license || result.license;
  result.additionalModules = (module || '').split(',').map(v => v.trim()).filter(v => !!v);
  result.author = author || '';

  if (name) {
    if (!UserInputValidator.validateAppName(name)) {
      throw new Error('Invalud --name property. --name property only allow [a-zA-Z0-9$].');
    } else {
      result.appName = name;
    }
  }

  if (lang) {
    if (!UserInputValidator.validateLanguage(lang)) {
      throw new Error('Invalud --language option. --lang option must be one of [ts/js] .');
    } else {
      result.language = LanguageType[lang];
    }
  }

  if (pm) {
    if (!UserInputValidator.validatePm(pm)) {
      throw new Error('Invalud --pm option. --pm option must be one of [npm/yarn].');
    } else {
      result.packageManager = PackageManagerName[pm];
    }
  }

  result.git.use = !!git;

  if (result.git.use) {
    result.git.remote = git;
  }

  return result;
}

export const handler = argv => {
  checkPkg(pkg);
  const opt = getOptions(argv);
  new Generator(opt).generate();
  PostInstalls.run();
};
