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
import {
  getPkg
} from './pkg';
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


export type InstallOpt = { modules: string[]; installType: PackageInstallType; installTypescriptTypes?: boolean };


export class PostInstalls {
  public static run() {
    const pkg = getPkg();

    if (pkg.rmvi.additionalModules.length) {
      this.install(pkg, {
        modules: pkg.rmvi.additionalModules,
        installType: PackageInstallType.PROD,
        installTypescriptTypes: pkg.rmvi.installTypes
      });
    }

    this.updateDLL();
    this.build();
  }


  public static update(pkg) {
    const modules = [];
    for (const dep in pkg.dependencies) {
      if (dep.indexOf('@react-mvi') > -1) {
        modules.push(dep);
      }
    }
    const packageManager = PackageManagerFactory.create(pkg.rmvi.packageManager);
    packageManager.uninstall(modules);
    packageManager.install(modules);

    if (!pkg.rmvi.migrated) {
      this.updateDLL();
    }
  }


  public static dev() {
    execSync('npm start', EXEC_OPT);
  }


  public static build(isDebug = false) {
    execSync(`npm run bundle${isDebug ? '-debug' : ''}`, EXEC_OPT);
  }


  public static install(pkg: any, { modules, installType, installTypescriptTypes }: InstallOpt) {
    if (modules.length) {
      const packageManager = PackageManagerFactory.create(pkg.rmvi.packageManager);
      packageManager.install(modules, installType);
      if (installTypescriptTypes) {
        this.installTypesIfExists(pkg, modules);
      }

      if (installType === PackageInstallType.PROD) {
        this.updateDLL();
      }
    }
  }


  public static test() {
    execSync('npm run test', EXEC_OPT);
  }


  private static installTypesIfExists(pkg, modules) {
    try {
      const types = modules.map(module => {
        const name = `@types/${module}`;
        const ret = execSync(`npm search --json ${name}`).toString('utf8');

        return JSON.parse(ret).map(v => v.name).filter(m => m === name);
      }).reduce((i, n) => i.concat(n), []);

      this.install(pkg, { modules: types, installType: PackageInstallType.DEV });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }


  private static updateDLL() {
    execSync(`npm run dll-prod`, EXEC_OPT);
    execSync(`npm run dll-debug`, EXEC_OPT);
  }
}
