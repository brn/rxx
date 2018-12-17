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

import { HandlerResponse, StreamStore, Handler } from '../handler';
import {
  registerHandlers,
  getHandlers,
  StateHandler,
  removeHandler,
} from '../state-handler';
import { StreamCollection } from '../stream-collection';
import { Subscription, Subject, Observable } from 'rxjs';
import { expect } from 'chai';

class TestHandler extends StateHandler {
  public push(p) {
    return new Promise(r => {});
  }
  public subscribe(p) {
    return new Subscription();
  }
  public clone() {
    return new TestHandler();
  }
}

class StreamStoreMock implements StreamCollection {
  public collection = {};
  public hasWithoutGlobal(key: string): boolean {
    return !!this.collection[key];
  }
  public has(key: string): boolean {
    return !!this.collection[key];
  }
  public getWithoutGlobal(key: string): Subject<any> {
    return this.collection[key];
  }
  public get(key: string): Subject<any>[] {
    return this.collection[key];
  }
  public add<T>(key: string): Subject<T> {
    return (this.collection[key] = new Subject<T>());
  }
}

describe('handler.ts', () => {
  describe('registerHandlers', () => {
    it('register state handlers to global registry.', () => {
      const handlers = { a: new TestHandler() };
      registerHandlers(handlers);
      expect(getHandlers()).to.be.deep.eq(handlers);
    });
  });

  describe('removeHandlers', () => {
    it('register state handlers to global registry.', () => {
      const handlers = { a: new TestHandler(), b: new TestHandler() };
      registerHandlers(handlers);
      removeHandler('a');
      expect(getHandlers()).to.be.deep.eq({ b: new TestHandler() });
    });
  });

  describe('StreamStore', () => {
    let store: StreamStore;
    let map: any;

    beforeEach(() => {
      map = {};
      store = new StreamStore(map);
    });

    describe('#hasWithOutGlobal()', () => {
      it('should check whether Subject was defined with specific key that except global key or not', () => {
        map['*::test'] = true;
        expect(store.hasWithoutGlobal('test::test')).to.be.eq(false);
        map['test::test'] = true;
        expect(store.hasWithoutGlobal('test::test')).to.be.eq(true);
      });
    });

    describe('#has()', () => {
      it('should check whether Subject was defined with specific key or not', () => {
        expect(store.has('test::test')).to.be.eq(false);
        map['*::test'] = true;
        expect(store.has('test::test')).to.be.eq(true);
      });
    });

    describe('#getWithoutGlobal()', () => {
      it('should get Subject by specific key that except global key', () => {
        const subject = {};
        map['test::test'] = subject;
        map['*::test'] = subject;
        expect(store.getWithoutGlobal('test::test')).to.be.deep.eq({});
        expect(store.getWithoutGlobal('test::test')).to.be.deep.eq({});
      });
    });

    describe('#get()', () => {
      it('should get Subject by specific key', () => {
        const subject = {};
        map['test::test'] = subject;
        expect(store.get('test::test')).to.be.deep.eq([{}]);
        map['*::test'] = subject;
        expect(store.get('test::test')).to.be.deep.eq([{}, {}]);
      });
    });
  });

  describe('HandlerResponse', () => {
    let response: HandlerResponse;
    let collection: StreamStoreMock;

    beforeEach(() => {
      response = new HandlerResponse((collection = new StreamStoreMock()));
    });

    describe('#for()', () => {
      it('should create slot to StreamStore', () => {
        const ob = response.for('test::test');
        expect(ob).to.be.instanceof(Observable);
        expect(collection.collection['test::test']).to.be.instanceof(Subject);
      });
    });
  });

  describe('StateHandler', () => {
    class TestHandler extends StateHandler {
      public constructor(advices) {
        super(advices, { greeting: ['hello', 'hi'] });
      }

      public clone(): Handler {
        return new TestHandler(this.advices);
      }

      public subscribe(p) {
        return new Subscription();
      }

      public push(...args) {
        return Promise.resolve(null);
      }

      public hello() {
        return 'Hello';
      }

      public hi() {
        return 'Hi';
      }
    }

    describe('constructor', () => {
      it('should set advices around method.', () => {
        const th = new TestHandler({
          greeting(mi) {
            return `${mi.proceed()} Tester!`;
          },
        });
        expect(th.hello()).to.be.eq('Hello Tester!');
        expect(th.hi()).to.be.eq('Hi Tester!');
      });
    });
  });
});
