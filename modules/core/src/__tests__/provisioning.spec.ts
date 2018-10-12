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
import { expect } from 'chai';
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
  public intent: TestIntent;

  public test: TestIntent;

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
  private intent: Intent;

  private testHandler: StateHandler;

  public getIntent() {
    return this.intent;
  }

  public getHandler() {
    return this.testHandler;
  }
}

@store
class TestParentStore implements Store<{ view: { parent: number } }> {
  public intent: TestParentIntent;

  public test: TestParentIntent;

  public initialize() {
    return {
      view: {
        parent: 1,
      },
    };
  }
}

@intent
class TestParentIntent {
  private intent: Intent;

  private testHandler: StateHandler;

  public getIntent() {
    return this.intent;
  }

  public getHandler() {
    return this.testHandler;
  }
}

@store
class TestGrandParentStore implements Store<{ view: { grandParent: number } }> {
  public intent: TestGrandParentIntent;

  public test: TestGrandParentIntent;

  public initialize() {
    return {
      view: {
        grandParent: 1,
      },
    };
  }
}

@intent
class TestGrandParentIntent {
  private intent: Intent;

  private testHandler: StateHandler;

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
  const context = {
    provisioning: (() => {
      const p = new Provisioning(
        '',
        {
          provisioning: (() => {
            const p = new Provisioning(
              '',
              {},
              { intent: TestGrandParentIntent },
              [TestGrandParentStore],
              undefined,
              {},
            );
            p.prepare();

            return p;
          })(),
          __intent: null,
          __subject: null,
        },
        { intent: TestParentIntent },
        [TestParentStore],
        undefined,
        {},
      );
      p.prepare();

      return p;
    })(),
    __intent: null,
    __subject: null,
  };
  const testHandler = new TestHandler();

  before(() => {
    registerHandlers({
      testHandler,
    });
  });

  describe('#prepare', () => {
    it('should connect store and intent and handler', () => {
      const p = new Provisioning(
        '',
        context,
        { intent: TestIntent },
        [TestStore],
        undefined,
        {},
      );
      p.prepare();
      expect(p.getIntentInstance().intent).to.be.instanceof(TestIntent);
      expect(p.getIntentInstance().intent.getIntent()).to.be.instanceof(
        HandlerResponse,
      );
      expect(p.getIntentInstance().intent.getHandler()).to.be.instanceof(
        HandlerResponse,
      );
      expect(p.getStores()[0]).to.be.instanceof(TestStore);
      expect((p.getStores()[0] as TestStore).intent).to.be.instanceof(
        TestIntent,
      );
      expect(p.getState()).to.be.deep.eq({
        view: { test: 1, parent: 1, grandParent: 1 },
      });
      expect(
        (p.getHandlers().testHandler as TestHandler).isSubscribed(),
      ).to.be.eq(true);
    });

    it('should accept intent map', () => {
      const p = new Provisioning(
        '',
        context,
        { test: TestIntent },
        [TestStore],
        undefined,
        {},
      );
      p.prepare();
      expect(p.getIntentInstance().test).to.be.instanceof(TestIntent);
      expect(p.getIntentInstance().test.getIntent()).to.be.instanceof(
        HandlerResponse,
      );
      expect(p.getIntentInstance().test.getHandler()).to.be.instanceof(
        HandlerResponse,
      );
      expect(p.getStores()[0]).to.be.instanceof(TestStore);
      expect((p.getStores()[0] as TestStore).test).to.be.instanceof(TestIntent);
      expect(p.getState()).to.be.deep.eq({
        view: { test: 1, parent: 1, grandParent: 1 },
      });
      expect(
        (p.getHandlers().testHandler as TestHandler).isSubscribed(),
      ).to.be.eq(true);
    });

    it('should accept state factories', () => {
      const p = new Provisioning(
        '',
        context,
        {},
        [],
        makeApp({
          test: (observable, state) => {
            return {
              view: observable.pipe(startWith(state)),
            };
          },
        })({ test: 1 }),
        {},
      );
      p.prepare();
      expect(p.getState()).to.be.deep.eq({
        view: { test: 1, parent: 1, grandParent: 1 },
      });
      expect(
        (p.getHandlers().testHandler as TestHandler).isSubscribed(),
      ).to.be.eq(true);
    });
  });
});
