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

/// <reference path="../_references.d.ts" />


/**
 * Create functor that is function behave like class.
 * @param {Function} fn The function that want to define methods.
 * @param {Object} props Methods.
 * @returns {Function} 
 */
function functor<T, U>(fn: T, props: U): T & U {
  for (var prop in props) {
    fn[prop] = props[prop];
  }
  return fn as T & U;
}


type Proc<T> = (e?: T) => void;

/**
 * Exit async function gracefully.
 * @param {Function} cb Async function.
 * @param {Function} done The Mocha async test case exit callback.
 * @returns {Function} The function that is notify error to mocha.
 */
export const graceful = functor((cb: (...args: any[]) => void, done: Proc<Error>, optCallback?: Proc<any>) => (...args: any[]) => {
  let error;
  try {
    cb.apply(this, args);
  } catch(e) {
    error = e;
  } finally {
    optCallback && optCallback();
    done(error);
  }
}, {
  /**
   * Run graceful function.
   * @param {Function} cb Async function.
   * @param {Function} done The Mocha async test case exit callback.
   * @returns {*} Function return value.
   */
  run: (cb: Proc<any>, done: Proc<Error>, optCallback?: Proc<any>) => graceful(cb, done, optCallback)()
});

/**
 * Create function that exit async test case.
 * @param {Function} done The Mocha async test case exit callback.
 * @returns {Function} Function that exit async test case.
 */
export const nothing = (done: Proc<Error>, optCallback?: Proc<any>) => () => (optCallback && optCallback(), done());

/**
 * Create function that exit test case if error thrown.
 * @param {Function} cb Async function.
 * @param {Function} done The Mocha async test case exit callback.
 * @returns {Function} Function that exit async test case if error thrown.
 */
export const stopOnError = functor((cb: (...args: any[]) => void, done: Proc<Error>, optCallback?: Proc<any>) => (...args: any[]) => {
  try {
    return cb.apply(this, args);
  } catch(e) {
    optCallback && optCallback();
    done(e);
  }
}, {
  run(cb: Proc<any>, done: Proc<any>, optCallback?: Proc<any>) {return stopOnError(cb, done, optCallback)()}
});


export class Joiner {
  private current = 0;

  constructor(private time, private cb) {}

  notify() {
    if (++this.current == this.time) {
      this.cb();
    }
  }
}


export const describeIf = (cond, name, cb) => {
  if (cond) {
    describe(name, cb);
  } else {
    describe.skip(name, cb);
  }
};


export const itIf = (cond, name, cb) => {
  if (cond) {
    it(name, cb);
  } else {
    it.skip(name, cb);
  }
};
