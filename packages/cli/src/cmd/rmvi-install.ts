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


import {
  PostInstalls
} from '../post-installs';
import {
  pkg,
  checkPkg
} from '../pkg';
import {
  PackageInstallType
} from '../package-manager';
import * as yargs from 'yargs';


export const command = 'install [modules..]';
export const desc = 'Install module with specified package maanger.';
export const builder = yargs => {
  return yargs
    .option('dev', { alias: 'D', desc: 'Install module in devDependencies.' })
    .option('peer', { desc: 'Install module in peerDependencies.' });
};

export const handler = async (argv) => {
  checkPkg(pkg, true);
  if (!pkg.version) {
    throw new Error('install called before init.');
  }

  const modules = argv.modules;
  try {
    await PostInstalls.install(pkg, {
      modules,
      installType: argv.dev ? PackageInstallType.DEV :
        PackageInstallType.PEER ? argv.peer : PackageInstallType.PROD,
      installTypescriptTypes: pkg.rmvi.installTypings
    });
    process.exit(0);
  } catch (e) {
    console.error(e.stack);
    process.exit(1);
  }
};
