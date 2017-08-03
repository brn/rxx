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

import 'colors';

declare module 'util' {
  export function promisify(fn: Function): (...args: any[]) => Promise<any>;
}

import {
  GeneratorRequirements
} from './types';
import {
  PackageManagerName
} from './package-manager';
import {
  LanguageType
} from './options';
import * as readline from 'readline';
import {
  promisify
} from 'util';


export function createDefaultOptions(): GeneratorRequirements {
  return {
    appName: 'app',
    license: 'MIT',
    additionalModules: [],
    language: LanguageType.TS,
    author: '',
    packageManager: PackageManagerName.NPM,
    git: {
      use: true,
      remote: ''
    }
  };
}


export class UserInputValidator {
  public static validateAppName(appName: string) {
    if (!appName) {
      console.warn('Application name is required!');

      return false;
    } else if (!/^[a-zA-Z$][a-zA-Z-_$0-9]+$/.test(appName)) {
      console.warn('Invalid application name!');

      return false;
    }

    return true;
  }

  public static validatePm(pm: string) {
    if (pm !== 'npm' && pm !== 'yarn') {
      return false;
    }

    return true;
  }


  public static validateYesNo(answer: string) {
    if (answer !== 'y' && answer !== 'n') {
      return false;
    }

    return true;
  }


  public static validateLanguage(lang: string) {
    if (lang !== 'ts' && lang !== 'js') {
      return false;
    }

    return true;
  }
}


export class Interaction {
  public static async collectInformation(): Promise<GeneratorRequirements> {
    const result = createDefaultOptions();
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = question => {
      return new Promise<string>(r => rl.question(question, r));
    };

    const getAppName = async () => {
      const appName = await question('Application name (default app)? ').then(v => v || result.appName);
      if (!UserInputValidator.validateAppName(appName)) {
        return await getAppName();
      }

      return appName;
    };
    result.appName = await getAppName();

    result.license = await question('License? ');

    result.author = await question('Author? ');

    const getPackageManager = async () => {
      const pm = await question('Select package manager (default npm) [npm/yarn] ').then(v => v || result.license);
      if (!pm) { return PackageManagerName.NPM; }
      if (!UserInputValidator.validatePm(pm)) {
        return await getPackageManager();
      }

      return pm === 'npm' ? PackageManagerName.NPM : PackageManagerName.YARN;
    };

    result.packageManager = await getPackageManager();

    const getFlagInstallAdditional = async () => {
      const flag = await question('Install addition module? (default no) [y/n] ').then(v => v || 'n');
      const yn = flag.toLowerCase();
      if (!UserInputValidator.validateYesNo(yn)) {
        await getFlagInstallAdditional();
      }

      return yn === 'y';
    };

    const flagInstallAddtional = await getFlagInstallAdditional();
    if (flagInstallAddtional) {
      const additionalModuleNames = await question('Input additional module names (comma separeated list like "react,read-dom") ');
      result.additionalModules = additionalModuleNames.split(',').map(v => v.trim());
    }

    const getLanguage = async () => {
      const languageInput = await question('Language are you want to use? (default ts) [ts/js] ').then(v => v || 'ts');
      const language = languageInput.toLowerCase();
      if (!UserInputValidator.validateLanguage(language)) {
        return await getLanguage();
      }

      return LanguageType[language.toUpperCase()];
    };
    result.language = await getLanguage();

    const getGitUse = async () => {
      const use = await question('Use Git? (default yes) [y/n] ').then(v => v || 'y');
      const isUse = use.toLowerCase();
      if (!UserInputValidator.validateYesNo(use)) {
        return await getGitUse();
      }

      return isUse === 'y';
    };
    result.git.use = await getGitUse();

    if (result.git.use) {
      result.git.remote = await question('Git repository url? (default empty) ').then(v => v || '');
    }

    this.print(result);
    const isSure = async () => {
      const ret = await question('Are you sure? [y/n] ');
      const answer = ret.toLowerCase();
      if (!UserInputValidator.validateYesNo(answer)) {
        return await isSure();
      }

      return answer === 'y';
    };
    const sure = await isSure();

    if (sure) {
      return result;
    } else {
      process.exit(0);
    }

    return result;
  }


  private static print(conf: GeneratorRequirements) {
    console.log('\n====== CONFIGURATIONS ======'.bold);
    console.log(`Application Name: ${conf.appName}`);
    console.log(`Author: ${conf.author}`);
    console.log(`License: ${conf.license}`);
    console.log(`Package Manager: ${PackageManagerName[conf.packageManager].toLowerCase()}`);
    console.log(`Use Git: ${conf.git.use ? 'y' : 'n'}`);
    if (conf.git.use) {
      console.log(`Git remote repository url: ${conf.git.remote}`);
    }
    console.log(`Additional Modules: ${conf.additionalModules}`);
    console.log(`Language: ${LanguageType[conf.language].toLowerCase()}`);
  }
}
