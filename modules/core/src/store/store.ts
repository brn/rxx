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

import { extend, symbol } from '../utils';
import { Observable } from 'rxjs';

export const STORE_SYMBOL = symbol('@@reactMVIStore');

/**
 * Store decorator that assign intent to instance property.
 */
export function store<T extends StoreConstructor<any, any>>(Base: T) {
  function EnhancedStore(intent, services?, subject?) {
    extend(this, intent);
    extend(this, { subject });
    if (services) {
      extend(this, services);
    }
    Base.call(this, intent);
  }
  EnhancedStore[STORE_SYMBOL] = true;
  EnhancedStore.prototype = Base.prototype;

  return EnhancedStore as any;
}

export interface Store<State> {
  initialize?(): State;
}

export type StoreConstructor<Intent, State> = new (...args: any[]) => Store<
  State
>;

export type StateFactory<
  T extends { [key: string]: any } = { [key: string]: any },
  InitialState = any
> = (observable: Observable<any>, initialState: InitialState) => T;
