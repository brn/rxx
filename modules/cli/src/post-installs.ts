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
  execSync
} from 'child_process';
import {
  npx
} from './options';
import {
  PackageManagerFactory,
  PackageInstallType
} from './package-manager';


/*tslint:disable:no-magic-numbers*/
const EXEC_OPT = { stdio: [0, 1, 2] };
/*tslint:enable:no-magic-numbers*/


export type InstallOpt = { modules: string[]; installType: PackageInstallType };


export class PostInstalls {
  public static async run() {
    execSync(`npm run dll-prod`, EXEC_OPT);
    execSync(`npm run dll-debug`, EXEC_OPT);
  }

  public static async update(pkg) {
    const modules = [];
    for (const dep in pkg.dependencies) {
      if (dep.indexOf('@react-mvi') > -1) {
        modules.push(dep);
      }
    }
    const packageManager = PackageManagerFactory.create(pkg.rmvi.packageManager);
    packageManager.uninstall(modules);
    packageManager.install(modules);
  }


  public static dev() {
    execSync('npm start', EXEC_OPT);
  }


  public static build(isDebug = false) {
    execSync(`npm run bundle${isDebug ? '-debug' : ''}`, EXEC_OPT);
  }


  public static install(pkg: any, { modules, installType }: InstallOpt) {
    const packageManager = PackageManagerFactory.create(pkg.rmvi.packageManager);
    packageManager.install(modules, installType);
  }


  public static test() {
    execSync('npm run test', EXEC_OPT);
  }
}
