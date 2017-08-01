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
  store,
  Store,
  intent,
  HandlerResponse
} from '@react-mvi/core';
import {
  Observable
} from 'rxjs/Rx';
import {
  prepareTest
} from '../prepare';
import {
  expect
} from 'chai';


@intent
class AIntent {
  private intent: HandlerResponse;

  public get test() {
    return this.intent.for('a::a').share();
  }
}


@store
class AStore implements Store<{ view: { test: Observable<number> } }> {
  private intent: AIntent;

  public initialize() {
    return {
      view: {
        test: this.intent.test.mapTo(1).startWith(0)
      }
    };
  }
}


describe('prepare()', () => {
  it('should prepare store and mocked intent', done => {
    const { store, mock } = prepareTest(AIntent, AStore);
    const { test } = store.initialize().view;
    test.skip(1).subscribe(v => {
      expect(v).to.be.eq(1);
      done();
    });
    mock.send('test');
  });
});
