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

declare module 'util' {
  export function promisify(fn: Function): (...args: any[]) => Promise<any>;
}

import {
  GeneratorRequirements
} from './types';
import {
  LanguageType
} from './options';
import * as readline from 'readline';
import {
  promisify
} from 'util';


export class Interaction {
  public static async collectInformation(): Promise<GeneratorRequirements> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = question => {
      return new Promise<string>(r => rl.question(question, r));
    };

    const getAppName = async () => {
      const appName = await question('Application name (default app)? ').then(v => v || 'app');
      if (!appName) {
        console.warn('Application name is required!');

        return await getAppName();
      } else if (!/^[a-zA-Z$][a-zA-Z-_$0-9]+$/.test(appName)) {
        console.warn('Invalid application name!');

        return await getAppName();
      }

      return appName;
    };
    const appName = await getAppName();

    const license = await question('License? ');

    const author = await question('Author? ');

    const getFlagInstallAdditional = async () => {
      const flag = await question('Install addition module? (default no) [y/n] ').then(v => v || 'n');
      const yn = flag.toLowerCase();
      if (yn !== 'y' && yn !== 'n') {
        await getFlagInstallAdditional();
      }

      return yn === 'y';
    };

    const flagInstallAddtional = await getFlagInstallAdditional();
    let additionalModules = [];
    if (flagInstallAddtional) {
      const additionalModuleNames = await question('Input additional module names (comma separeated list like "react,read-dom") ');
      additionalModules = additionalModuleNames.split(',').map(v => v.trim());
    }

    const getLanguage = async () => {
      const languageInput = await question('Language are you want to use? (default ts) [ts/js] ').then(v => v || 'ts');
      const language = languageInput.toLowerCase();
      if (language !== 'ts' && language !== 'js') {
        return await getLanguage();
      }

      return language === 'ts' ? LanguageType.TS : LanguageType.JS;
    };
    const language = await getLanguage();

    const result = {
      appName,
      license,
      additionalModules,
      language,
      author
    };

    this.print(result);
    const isSure = async () => {
      const ret = await question('Are you sure? [y/n] ');
      const answer = ret.toLowerCase();
      if (answer !== 'y' && answer !== 'n') {
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
    console.log('====== CONFIGURATIONS ======');
    console.log(`Application Name: ${conf.appName}`);
    console.log(`Author: ${conf.author}`);
    console.log(`License: ${conf.license}`);
    console.log(`Additional Modules: ${conf.additionalModules}`);
    console.log(`Language: ${LanguageType[conf.language].toLowerCase()}`);
  }
}
