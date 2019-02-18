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

import * as fs from "fs";
import { getPkg } from "./pkg";
import { npx } from "./options";
import { PackageManagerFactory, PackageInstallType } from "./package-manager";
import { Process } from "./process";

/*tslint:disable:no-magic-numbers*/
const EXEC_OPT = { stdio: [0, 1, 2] };
/*tslint:enable:no-magic-numbers*/

export type InstallOpt = {
  modules: string[];
  installType: PackageInstallType;
  installTypescriptTypes?: boolean;
};

export class PostInstalls {
  public static async run() {
    const pkg = getPkg();

    if (pkg.rmvi.additionalModules.length) {
      await this.install(pkg, {
        modules: pkg.rmvi.additionalModules,
        installType: PackageInstallType.PROD,
        installTypescriptTypes: pkg.rmvi.installTypes
      });
    }

    await this.updateDLL();
    await this.build();
  }

  public static async update(pkg) {
    const modules = [];
    for (const dep in pkg.dependencies) {
      if (dep.indexOf("@rxx") > -1) {
        modules.push(dep);
      }
    }
    const packageManager = PackageManagerFactory.create(
      pkg.rmvi.packageManager
    );
    await packageManager.uninstall(modules);
    await packageManager.install(modules);

    if (!pkg.rmvi.migrated) {
      await this.updateDLL();
    }
  }

  public static async dev() {
    return await Process.run("npm", ["start"]);
  }

  public static async build(isDebug = false) {
    return await Process.run("npm", [
      "run",
      `webpack${isDebug ? "-debug" : ""}`
    ]);
  }

  public static async install(
    pkg: any,
    { modules, installType, installTypescriptTypes }: InstallOpt
  ) {
    if (modules.length) {
      const packageManager = PackageManagerFactory.create(
        pkg.rmvi.packageManager
      );
      await packageManager.install(modules, installType);
      if (installTypescriptTypes) {
        await this.installTypesIfExists(pkg, modules);
      }

      if (installType === PackageInstallType.PROD) {
        await this.updateDLL();
      }
    }
  }

  public static async test() {
    return await Process.run("npm", ["run", "test"]);
  }

  private static async installTypesIfExists(pkg, modules) {
    try {
      const jsons = [];
      const loop = async index => {
        const module = modules[index];
        const name = `@types/${module}`;
        const { stdout } = await Process.run(
          "npm",
          ["search", "--json", "name"],
          true
        );
        const next = index + 1;
        jsons.push(
          JSON.parse(stdout)
            .map(v => v.name)
            .filter(m => m === name)
        );
        if (modules.length > next) {
          await loop(modules[next]);
        }
      };

      await loop(0);
      const types = jsons.reduce((i, n) => i.concat(n), []);

      await this.install(pkg, {
        modules: types,
        installType: PackageInstallType.DEV
      });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  private static async updateDLL() {
    await Process.run("npm", ["run", "dll"]);
  }
}
