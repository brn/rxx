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


import uniq = require('lodash.uniq');
import * as npm from 'npm';
import {
  execSync
} from 'child_process';
import {
  singleton
} from './options';
import {
  Process
} from './process';


/*tslint:disable:no-magic-numbers*/
const stdio = [0, 1, 2];
/*tslint:enable:no-magic-numbers*/


export enum PackageInstallType {
  DEV = 1,
  PROD = 2,
  PEER = 3
}


export enum PackageManagerName {
  NPM = 1,
  YARN
}


export interface PackageManager {
  install(modules: string[], type?: PackageInstallType): Promise<any>;
  uninstall(modules: string[]): Promise<any>;
  name: string;
}


export function sanitizeModuleNameList(modules: string[]) {
  return uniq(modules.map(v => v.trim()));
}


@singleton
export class Npm implements PackageManager {
  public name = 'npm';

  public static instance: Npm;

  public async install(modules: string[], type = PackageInstallType.PROD) {
    const opt = type === PackageInstallType.DEV ? ['-D'] : [];

    return await Process.run('npm', ['install', ...sanitizeModuleNameList(modules), ...opt]);
  }


  public async uninstall(modules: string[]) {
    return await Process.run('npm', ['uninstall', ...modules]);
  }
}


@singleton
export class Yarn implements PackageManager {
  public name = 'yarn';

  public static instance: Yarn;

  public async install(modules: string[], type = PackageInstallType.PROD) {
    await this.checkYarn();
    const opt = type === PackageInstallType.DEV ? ['-D'] : [];

    return await Process.run('yarn', ['add', ...sanitizeModuleNameList(modules), ...opt]);
  }


  public async uninstall(modules: string[]) {
    await this.checkYarn();

    return await Process.run('yarn', ['remove', ...modules]);
  }


  private async checkYarn() {
    try {
      await Process.run('yarn', ['--version']);
    } catch (e) {
      console.log('yarn not found. So install.');
      await Process.run('npm', ['i', '-g', 'yarn']);
    }
  }
}


export class PackageManagerFactory {
  public static create(type: string | PackageManagerName = PackageManagerName.NPM): PackageManager {
    let pkgmType: PackageManagerName;
    if (typeof type === 'string') {
      pkgmType = PackageManagerName[type.toUpperCase()];
    } else {
      pkgmType = type;
    }

    switch (pkgmType) {
      case PackageManagerName.NPM:
        return Npm.instance;
      case PackageManagerName.YARN:
        return Yarn.instance;
      default:
        throw new Error('Invalid package manager type!');
    }
  }
}
