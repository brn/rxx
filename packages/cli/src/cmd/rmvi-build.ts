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

import * as yargs from 'yargs';
import {
  PostInstalls
} from '../post-installs';
import {
  pkg,
  checkPkg
} from '../pkg';

export const command = 'build';
export const desc = 'Build your application.';
export const builder = (yargs) => {
  return yargs.option('--debug', { alias: '-d' });
};

export const handler = async (argv) => {
  checkPkg(pkg);
  if (!pkg.version) {
    throw new Error('build called before init.');
  }

  try {
    await PostInstalls.build(argv.debug);
  } catch (e) {
    console.error(e.stack);
    process.exit(1);
  }

  process.exit(0);
};
