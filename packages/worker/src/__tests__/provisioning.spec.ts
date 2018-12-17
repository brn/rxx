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

import { Subscription } from 'rxjs';
import assert from 'power-assert';
import nodeAssert from 'assert';
import { Provisioning } from '../provisioning';
import { HandlerResponse } from '../handler/handler';
import { StateHandler, registerHandlers } from '../handler/state-handler';
import { store, Store } from '../store/store';
import { intent, Intent } from '../intent/intent';
import { startWith } from 'rxjs/operators';
import { mergeDeep } from '../utils';
import { makeApp } from '../factory';

type State = { view: { test: number } };

@store
class TestStore implements Store<State> {
  public intent!: TestIntent;

  public test!: TestIntent;

  public initialize() {
    return {
      view: {
        test: 1,
      },
    };
  }
}

@intent
class TestIntent {
  private intent!: Intent;

  private testHandler!: StateHandler;

  public getIntent() {
    return this.intent;
  }

  public getHandler() {
    return this.testHandler;
  }
}

class TestHandler extends StateHandler {
  private subscribed = false;

  public subscribe(a) {
    this.subscribed = true;

    return new Subscription();
  }

  public isSubscribed() {
    return this.subscribed;
  }

  public push(k, a) {
    return new Promise(r => {});
  }

  public clone() {
    return new TestHandler();
  }
}

describe('Provisioning', () => {
  const testHandler = new TestHandler();

  beforeAll(() => {
    registerHandlers({
      testHandler,
    });
  });

  describe('#prepare', () => {
    it('should connect store and intent and handler', () => {
      const p = new Provisioning(
        { intent: TestIntent },
        [TestStore],
        undefined,
        {},
      );
      p.prepare();
      nodeAssert.deepStrictEqual(p.getState(), {
        view: { test: 1 },
      });
      assert.ok((p.getHandlers().testHandler as TestHandler).isSubscribed());
    });

    it('should accept intent map', () => {
      const p = new Provisioning(
        { test: TestIntent },
        [TestStore],
        undefined,
        {},
      );
      p.prepare();
      nodeAssert.deepStrictEqual(p.getState(), {
        view: { test: 1 },
      });
      assert.ok((p.getHandlers().testHandler as TestHandler).isSubscribed());
    });

    it('should accept state factories', () => {
      const p = new Provisioning(
        {},
        [],
        makeApp(
          {
            test: (observable, state) => {
              return {
                view: observable.pipe(startWith(state)),
              };
            },
          },
          { test: 1 },
        ),
        {},
      );
      p.prepare();
      nodeAssert.deepStrictEqual(p.getState(), {
        view: { test: 1 },
      });
      assert.ok((p.getHandlers().testHandler as TestHandler).isSubscribed());
    });
  });
});
