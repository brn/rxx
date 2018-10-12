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
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */

import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

const sym = s => (typeof Symbol === 'function' ? Symbol(s) : `@@${s}`);

const STATE_SYM = sym('ReactMVIMockedIntentState');
const SUBJECT_SYM = sym('ReactMVIMockedIntentSubject');

const BUILTINS = (() => {
  const keys = Object.getOwnPropertyNames(Object.prototype);
  const result = Object.create(null);
  for (let i = 0, len = keys.length; i < len; i++) {
    result[keys[i]] = true;
  }
  result.constructor = true;

  return result;
})();

export class Mocker {
  public constructor(intent: any, state: any) {
    this[SUBJECT_SYM] = {};
    this[STATE_SYM] = state;

    let proto = intent;
    while (proto && proto !== Object.prototype) {
      Object.getOwnPropertyNames(proto).forEach(key => {
        if (this[key] || BUILTINS[key]) {
          return;
        }

        const descriptor = Object.getOwnPropertyDescriptor(proto, key);
        if (descriptor) {
          if (typeof descriptor.get === 'function') {
            const clone: PropertyDescriptor = { ...descriptor };
            clone.get = Mocker.proxify(this, key);
            Object.defineProperty(this, key, clone);
          } else if (typeof descriptor.value === 'function') {
            this[key] = Mocker.proxify(this, key);
          }
        }
      });
      proto = proto.__proto__;
    }
  }

  private static proxify(mocker: Mocker, methodName: string) {
    mocker[SUBJECT_SYM][methodName] = new Subject<any>();

    return () => {
      return mocker[SUBJECT_SYM][methodName].pipe(share());
    };
  }
}

export class MockManipulator {
  constructor(private mocker: Mocker) {}

  public send(name: string, data: any = {}) {
    MockManipulator.send(this.mocker, name, data);
  }

  public sendWithoutState(name: string, data: any = {}) {
    MockManipulator.sendWithoutState(this.mocker, name, data);
  }

  public static send(mock: Mocker, name: string, data: any = {}) {
    if (!mock[SUBJECT_SYM][name]) {
      throw new Error(`$[name} is not valid property name.`);
    }
    mock[SUBJECT_SYM][name].next({ data, state: mock[STATE_SYM] });
  }

  public static sendWithoutState(mock: Mocker, name: string, data = {}) {
    if (!mock[SUBJECT_SYM][name]) {
      throw new Error(`$[name} is not valid property name.`);
    }
    mock[SUBJECT_SYM][name].next(data);
  }
}
