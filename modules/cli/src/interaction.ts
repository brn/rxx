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
    installTypings: true,
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


type InteractionConfig = {
  message: string;
  update(v: any, result: GeneratorRequirements): void;
  lower?: boolean;
  child?: InteractionConfig & { if(v: any): boolean };
  defaultValue?(requirements: GeneratorRequirements): string;
  validation?(value: string): boolean;
};


const identify = v => v;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = question => {
  return new Promise<string>(r => rl.question(question, r));
};

const INTERACTIONS: InteractionConfig[] = [
  {
    message: 'Application name (default app)?',
    update(v, r) { r.appName = v; },
    defaultValue(r) { return r.appName; },
    validation(v) { return UserInputValidator.validateAppName(v); }
  },
  {
    message: 'License?',
    defaultValue(v) { return v.license; },
    update(v: string, r) { r.license = v.toUpperCase(); }
  },
  {
    message: 'Author?',
    update(v, r) { r.author = v; }
  },
  {
    message: 'Select package manager (default npm) [npm/yarn]',
    update(pm: string, r) { r.packageManager = pm === 'npm' ? PackageManagerName.NPM : PackageManagerName.YARN; },
    defaultValue(v) { return PackageManagerName[v.packageManager]; },
    validation(v) { return UserInputValidator.validatePm(v); },
    lower: true
  },
  {
    message: 'Install addition module? (default no) [y/n]',
    update(v, r) { },
    defaultValue() { return 'n'; },
    validation(v) { return UserInputValidator.validateYesNo(v); },
    lower: true,
    child: {
      if: v => v === 'y',
      message: 'Input additional module names (comma separeated list like "react,read-dom")',
      update(v, r) { r.additionalModules = v.split(',').map(v => v.trim()); }
    }
  },
  {
    message: 'Language are you want to use? (default ts) [ts/js]',
    defaultValue: r => LanguageType[r.language].toLowerCase(),
    update: (v: string, r) => r.language = LanguageType[v.toUpperCase()],
    validation: v => UserInputValidator.validateLanguage(v),
    lower: true,
    child: {
      if: v => v === 'ts',
      defaultValue: v => 'y',
      message: 'Install typings when new module installed if possible? (default yes) [y/n]',
      lower: true,
      update(v, r) { r.installTypings = v === 'y'; }
    }
  },
  {
    message: 'Use Git? (default yes) [y/n]',
    defaultValue: v => 'y',
    validation: use => UserInputValidator.validateYesNo(use),
    update: (v, r) => r.git.use = v === 'y',
    lower: true,
    child: {
      if: v => v === 'y',
      message: 'Git repository url? (default empty)',
      update: (v, r) => r.git.remote = v
    }
  }
];


export class Interaction {
  public static async collectInformation(): Promise<GeneratorRequirements> {
    return await this.processInteractions(INTERACTIONS);
  }


  private static async processInteractions(interactions: InteractionConfig[]) {
    const result = createDefaultOptions();
    const handler = interactions.map(interaction => {
      return this.createInteractionHandler(interaction, result);
    });
    const confirmationHandler = this.createInteractionHandler({
      message: 'Are you ok? [y/n]',
      update() { },
      validation: v => UserInputValidator.validateYesNo(v)
    }, result);

    const loop = async (nextHandler: () => Promise<any>) => {
      try {
        await nextHandler();
        if (handler.length) {
          return await loop(handler.shift());
        }
        this.print(result);

        return await confirmationHandler();
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    };

    const exit = await loop(handler.shift());
    if (exit !== 'y') {
      process.exit(1);
    }

    return result;
  }


  private static createInteractionHandler(
    { message, update, child = null, lower = false, defaultValue, validation = v => true }: InteractionConfig,
    requirements: GeneratorRequirements): () => Promise<any> {
    const handler = async () => {
      try {
        const rawResult = await question(`${message} `).then(v => v || (defaultValue ? defaultValue(requirements) : ''));
        const result = lower ? rawResult.toLowerCase() : rawResult;
        if (!validation(result)) {
          return await handler();
        }

        update(result, requirements);

        if (child && child.if(result)) {
          return await this.createInteractionHandler(child, requirements)();
        }

        return result;
      } catch (e) {
        throw e;
      }
    };

    return handler;
  }


  private static print(conf: GeneratorRequirements) {
    console.log('\n====== CONFIGURATIONS ======'.bold);
    console.log(`Application Name            : ${conf.appName}`);
    console.log(`Author                      : ${conf.author}`);
    console.log(`License                     : ${conf.license}`);
    console.log(`Package Manager             : ${PackageManagerName[conf.packageManager].toLowerCase()}`);
    console.log(`Use Git                     : ${conf.git.use ? 'y' : 'n'}`);
    if (conf.git.use) {
      console.log(`Git remote repository       : ${conf.git.remote}`);
    }
    console.log(`Additional Modules          : ${conf.additionalModules}`);
    console.log(`Language                    : ${LanguageType[conf.language].toLowerCase()}`);
    if (conf.language === LanguageType.TS) {
      console.log(`Install typings with module : ${conf.installTypings}`);
    }
  }
}
