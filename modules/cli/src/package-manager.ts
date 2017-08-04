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
import {
  execSync
} from 'child_process';
import {
  singleton
} from './options';


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
  install(modules: string[], type?: PackageInstallType): void;
  uninstall(modules: string[]): void;
  name: string;
}


export function sanitizeModuleNameList(modules: string[]) {
  return uniq(modules.map(v => v.trim()));
}


@singleton
export class Npm implements PackageManager {
  public name = 'npm';

  public static instance: Npm;

  public install(modules: string[], type = PackageInstallType.PROD) {
    execSync(`npm install ${sanitizeModuleNameList(modules).join(' ')} ${type === PackageInstallType.DEV ? '-D' : ''}`, { stdio });
  }


  public uninstall(modules: string[]) {
    execSync(`npm uninstall ${modules.join(' ')}`, { stdio });
  }
}


@singleton
export class Yarn implements PackageManager {
  public name = 'yarn';

  public static instance: Yarn;

  public install(modules: string[], type = PackageInstallType.PROD) {
    this.checkYarn();
    execSync(`yarn add ${sanitizeModuleNameList(modules).join(' ')} ${type === PackageInstallType.DEV ? '-D' : ''}`, { stdio });
  }


  public uninstall(modules: string[]) {
    this.checkYarn();
    execSync(`yarn remove ${modules.join(' ')}`, { stdio });
  }


  private checkYarn() {
    try {
      execSync('yarn --version');
    } catch (e) {
      console.log('yarn not found. So install.');
      execSync('npm i -g yarn', { stdio });
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
