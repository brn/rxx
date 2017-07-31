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

import {
  GeneratorRequirements
} from './types';
import {
  LanguageType
} from './options';

declare module 'util' {
  export function promisify(fn: Function): (...args: any[]) => Promise<any>;
}

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

    const question = promisify((question, callback) => {
      rl.question(question, callback.bind(null, null));
    });

    const getAppName = async () => {
      const appName = await question('Application name?');
      if (!appName) {
        console.warn('Application name is required!');

        return await getAppName();
      } else if (!/^[a-zA-Z$][a-zA-Z-_$0-9]+$/.test(appName)) {
        console.warn('Invalid application name!');

        return await getAppName();
      }

      return appName;
    };
    const appName = getAppName();

    const flagInstallAddtional = await question('Install addition module? (y/n)');
    let additionalModules = [];
    if (flagInstallAddtional) {
      const additionalModuleNames = await question('Input additional module names (comma separeated list like "react,read-dom")');
      additionalModules = additionalModuleNames.split(',').map(v => v.trim());
    }

    const getLanguage = async () => {
      const language = await question('Language are you want to use? (default ts) [ts/js]');
      if (language !== 'ts' && language !== 'js') {
        return await getLanguage();
      }

      return language === 'ts' ? LanguageType.TS : LanguageType.JS;
    };
    const language = await getLanguage();

    return {
      appName,
      additionalModules,
      language
    };
  }
}
