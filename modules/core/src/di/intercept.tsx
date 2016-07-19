// -*- mode: typescript -*-
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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview 
 * @author Taketoshi Aono
 */


import {
  Symbol
} from '../shims/symbol';
import {
  _
} from '../shims/lodash';


/**
 * Initialize array by specified key.
 * @param target Target object.
 * @param key A key.
 */
function initList(target: any, key: symbol) {
  if (!target[key]) {
    target[key] = [];
  }
}


/**
 * Intercept methods that are specified by regular expression.
 * @param key Symbol to intercept.
 * @param regexp Regular expression that specify methods.
 * @returns Class decorator.
 */
export function interceptAll(key: symbol, regexp: RegExp) {
  return <T extends Function>(target: T) => {
    initList(target.prototype, key);
    target.prototype[key].push(regexp);
  }
}


/**
 * Specifiy injector to intercept method.
 * @param key Symbol to intercept.
 * @returns Method decorator.
 */
export function intercept(key: symbol) {
  return (target: Object, propertyKey: string | symbol): void => {
    if (target[key] && _.isRegExp(target[key][0])) {
      throw new Error('Cannot intercept already annotated with @interceptAll');
    }
    initList(target, key);
    target[key].push(propertyKey);
    return null;
  }
}