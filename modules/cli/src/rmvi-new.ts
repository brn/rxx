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


import * as commander from 'commander';
import {
  Interaction,
  UserInputValidator,
  createDefaultOptions
} from './interaction';
import {
  PackageManagerName
} from './package-manager';
import {
  Generator
} from './generator';
import {
  LanguageType
} from './options';
import {
  PostInstalls
} from './post-installs';

/*tslint:disable:no-string-literal*/
(commander as any)['name'] = null;
/*tslint:enable:no-string-literal*/
commander
  .option('-n, --name [name]', 'Application name.')
  .option('-l, --license [license]', 'Application license')
  .option('-a, --author [authoer]', 'Application Author')
  .option('-p, --pm [package-manager]', 'Package manager one of [npm/yarn]')
  .option('-m, --module [additional-modules...]', 'Additional install modules (comma separeated list like "react,react-dom")')
  .option('-l, --lang [language]', 'Language one of [ts/js]')
  .option('-g, --git [repository]', 'Initialize git.')
  .allowUnknownOption(false)
  .parse(process.argv);


type Options = {
  name?: string;
  license?: string;
  author?: string;
  pm?: 'npm' | 'yarn';
  module?: string;
  lang?: 'ts' | 'js';
  git?: string;
};


function getOptions() {
  const result = createDefaultOptions();
  const { name, license, author, pm, module, lang, git }: Options = commander.opts();

  result.license = license;
  result.additionalModules = (module || '').split(',').map(v => v.trim());
  result.author = author;

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


const opt = getOptions();
new Generator(opt).generate();
PostInstalls.run();
