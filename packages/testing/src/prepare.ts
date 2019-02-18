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

import {
  getHandlers,
  IntentConstructor,
  Intent,
  mapValues,
  StoreConstructor,
  Store,
  Provisioning,
  StateHandler,
  registerHandlers,
  isObject,
  StateFactory,
  SubjectPayload,
  makeApp,
  InitialStateFactory,
  SubjectTree,
} from '@rxx/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { Mocker, MockManipulator } from './mocker';
import { Interrupter } from './interrupter';
import { share } from 'rxjs/operators';
import { connectDevTools } from '@rxx/core/lib/development/devtools';

export type Prepared<V, I = IntentConstructor> = {
  stores: Store<V>[];
  store: Store<V>;
  mock: I extends IntentConstructor
    ? MockManipulator
    : { [P in keyof I]: MockManipulator };
};

export type PrepareOptions = {
  services?: { [key: string]: any };
  handlers?: { [key: string]: StateHandler };
  state?: any;
  multiIntent?: boolean;
};

/**
 * Prepare Intent and Store.
 * @param IntentClass Intent constructor.
 * @param StoreClass Store constructor or Array of Store constructor.
 * @param opt Options if contains handlers, call registerHandlers with that,
 * if contains state, set as parent state of intent arguments.
 */
export function prepareTest<
  T extends IntentConstructor | { [key: string]: IntentConstructor },
  U extends StoreConstructor<T, V>,
  V
>(
  IntentClass: T,
  StoreClass: StoreConstructor<T, V> | StoreConstructor<T, V>[],
  opt: PrepareOptions = { state: {}, multiIntent: false },
): Prepared<V, T> {
  if (opt && opt.handlers) {
    registerHandlers(opt.handlers);
  }

  const context = {
    state: opt.state,
    mergedState: opt.state,
    __intent: null,
    __subject: null,
  };
  const provisioning = new Provisioning(
    '',
    {},
    isObject<{ [key: string]: IntentConstructor }>(IntentClass)
      ? (IntentClass as any)
      : { intent: IntentClass },
    Array.isArray(StoreClass) ? StoreClass : [StoreClass],
    undefined,
    opt.services || {},
    {},
    intent => new Mocker(intent, opt.state),
  );
  provisioning.prepare();

  return {
    store: provisioning.getStores()[0],
    stores: provisioning.getStores(),
    mock: opt.multiIntent
      ? ((() => {
          const map = provisioning.getIntentInstance();
          const ret: { [P in keyof T]: MockManipulator } = {} as any;
          for (const key in map) {
            ret[key] = new MockManipulator(map[key]);
          }

          return ret;
        })() as any)
      : (new MockManipulator(provisioning.getIntentInstance().intent) as any),
  };
}

interface AppTesterOption {
  states: { [key: string]: any };
}
export function initAppTester<S, I>(
  app: StateFactory<S, I>,
  initialState: I,
  opt: AppTesterOption = { states: {} },
): { input(type: string, payload?: any): void; output: S } {
  const input = new SubjectTree(connectDevTools({ name: '', instanceId: '' }));
  const output = app(input.observable, initialState);
  input.setState(opt.states);
  return {
    input(type: string, payload: any = null) {
      input.notify({ type, payload });
    },
    output,
  };
}

export function safeSubscribe<S>(
  observable: Observable<S>,
  callback: (v: S) => Promise<any>,
  done: (...args: any[]) => void,
  subscription: Subscription = new Subscription(),
) {
  subscription.add(
    observable.subscribe(v => {
      callback(v).then(() => done(), done);
    }),
  );
  return subscription;
}
