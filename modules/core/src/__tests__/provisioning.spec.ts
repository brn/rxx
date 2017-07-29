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
  Subscription
} from 'rxjs/Rx';
import {
  expect
} from 'chai';
import {
  Provisioning
} from '../provisioning';
import {
  StateHandler,
  HandlerResponse,
  registerHandlers
} from '../handler/handler';
import {
  store,
  Store
} from '../store/store';
import {
  intent,
  Intent
} from '../intent/intent';


type State = { view: { test: number } };

@store
class TestStore implements Store<State> {
  public intent: TestIntent;

  public initialize() {
    return {
      view: {
        test: 1
      }
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


class TestHandler extends StateHandler {
  private subscribed = false;

  public subscribe(a) {
    this.subscribed = true;

    return new Subscription();
  }

  public isSubscribed() { return this.subscribed; }

  public push(k, a) { return new Promise(r => { }); }
}


describe('Provisioning', () => {
  const context = { state: { parentState: true }, __intent: null };
  const testHandler = new TestHandler();

  before(() => {
    registerHandlers({
      testHandler
    });
  });

  describe('#prepare', () => {
    it('should connect store and intent and handler', () => {
      const p = new Provisioning(context, TestIntent, TestStore, {});
      p.prepare();
      expect(p.getIntentInstance()).to.be.instanceof(TestIntent);
      expect(p.getIntentInstance().getIntent()).to.be.instanceof(HandlerResponse);
      expect(p.getIntentInstance().getHandler()).to.be.instanceof(HandlerResponse);
      expect(p.getStores()[0]).to.be.instanceof(TestStore);
      expect((p.getStores()[0] as TestStore).intent).to.be.instanceof(TestIntent);
      expect(p.getState()).to.be.deep.eq({ view: { test: 1 } });
      expect(testHandler.isSubscribed()).to.be.eq(true);
    });
  });
});
