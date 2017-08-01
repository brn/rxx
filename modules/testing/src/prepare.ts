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
  registerHandlers
} from '@react-mvi/core';
import {
  Mocker,
  MockManipulator
} from './mocker';


export type Prepared<V> = {
  stores: Store<V>[];
  store: Store<V>;
  mock: MockManipulator;
};


export type PrepareOptions = {
  services?: { [key: string]: any };
  handlers?: { [key: string]: StateHandler };
  state?: any;
};


/**
 * Prepare Intent and Store.
 * @param IntentClass Intent constructor.
 * @param StoreClass Store constructor or Array of Store constructor.
 * @param opt Options if contains handlers, call registerHandlers with that,  
 * if contains state, set as parent state of intent arguments.
 */
export function prepareTest<T extends IntentConstructor, U extends StoreConstructor<T, V>, V>(
  IntentClass: T,
  StoreClass: StoreConstructor<T, V> | StoreConstructor<T, V>[],
  opt: PrepareOptions = { state: {} }): Prepared<V> {

  if (opt && opt.handlers) {
    registerHandlers(opt.handlers);
  }

  const context = { state: opt.state, __intent: null };
  const provisioning = new Provisioning(context, IntentClass, StoreClass, opt.services || {}, intent => new Mocker(intent, opt.state));
  provisioning.prepare();

  return {
    store: provisioning.getStores()[0],
    stores: provisioning.getStores(),
    mock: new MockManipulator(provisioning.getIntentInstance())
  };
}
