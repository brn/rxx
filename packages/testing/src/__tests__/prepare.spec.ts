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

import 'core-js';
import {
  store,
  Store,
  intent,
  HandlerResponse,
  SubjectPayload,
  makeApp,
} from '@react-mvi/worker';
import { Observable } from 'rxjs';
import { share, mapTo, startWith, skip, filter, tap } from 'rxjs/operators';
import { prepareTest, initAppTester, safeSubscribe } from '../prepare';
import { expect } from 'chai';

@intent
class AIntent {
  private intent!: HandlerResponse;

  public get test() {
    return this.intent.for('a::a').pipe(share());
  }
}

@store
class AStore implements Store<{ view: { test: Observable<number> } }> {
  private intent!: AIntent;
  private aIntent!: AIntent;

  public initialize() {
    return {
      view: {
        test: (this.intent || this.aIntent).test.pipe(
          mapTo(1),
          startWith(0),
        ),
      },
    };
  }
}

function factory(
  observable: Observable<SubjectPayload<string, any, any>>,
  initialState: number,
) {
  return {
    view: observable.pipe(
      filter(args => args.type === 'test'),
      mapTo(1),
    ),
  };
}

describe('prepare()', () => {
  it('should prepare store and mocked intent', done => {
    const { store, mock } = prepareTest(AIntent, AStore);
    const { test } = store.initialize!().view;
    test.pipe(skip(1)).subscribe(v => {
      expect(v).to.be.eq(1);
      done();
    });
    mock.send('test');
  });

  it('should prepare store and multi mocked intent', done => {
    const { store, mock } = prepareTest({ aIntent: AIntent }, AStore, {
      multiIntent: true,
    });
    const { test } = store.initialize!().view;
    test.pipe(skip(1)).subscribe(v => {
      expect(v).to.be.eq(1);
      done();
    });

    mock.aIntent.send('test');
  });
});

describe('interrupt', () => {
  it('should prepare store mock', done => {
    const { input, output } = initAppTester(factory, 1);

    const sub = safeSubscribe(
      output.view,
      async state => {
        expect(state).to.be.eq(1);
        sub.unsubscribe();
      },
      done,
    );
    input('test');
  });
});
