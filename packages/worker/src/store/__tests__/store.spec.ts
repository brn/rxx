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

import { store, STORE_SYMBOL } from '../store';
import { expect } from 'chai';

@store
class S {
  public a: any;
  public b: any;
  public initialize() {
    return {};
  }
  public intent: any;
  public constructor(intent, service?) {}
}
const intent = {};
const service = { a: {}, b: {} };

describe('store', () => {
  it('create enhanced constructor that define intent as property', () => {
    const store = new S({ intent });

    expect(S[STORE_SYMBOL]).to.be.eq(true);
    expect(store.intent).to.be.eq(intent);
  });

  it('create enhanced constructor that extend base class properties by services.', () => {
    const store = new S({ intent }, service);

    expect(S[STORE_SYMBOL]).to.be.eq(true);
    expect(store.intent).to.be.eq(intent);
    expect(store.a).to.be.eq(service.a);
    expect(store.b).to.be.eq(service.b);
  });
});
