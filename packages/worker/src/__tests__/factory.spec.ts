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

import { Observable, Subject } from 'rxjs';
import { HandlerResponse } from '../handler/handler';
import { intent } from '../intent/intent';
import { Store, store } from '../store/store';
import { expect } from 'chai';
import { SubjectPayload } from '../subject';
import { scan, share, startWith, map, filter } from 'rxjs/operators';
import { makeApp, run } from '../factory';
import { reducer } from '../reducer';
import { WorkerPostEventType, WorkerPayload } from '../worker';
import assert from 'power-assert';
import nodeAssert from 'assert';

@intent
class Intent {
  private intent!: HandlerResponse;

  public test(): Observable<{}> {
    return this.intent.for<{}, {}>('test').pipe(share());
  }
}

@store
class TestStore implements Store<{ view: { test: Observable<number> } }> {
  private intent!: Intent;

  private subject!: Observable<
    SubjectPayload<'subject-test', number, { test2: number }>
  >;

  public initialize() {
    return {
      view: {
        base: this.intent.test().pipe(
          scan((acc, next: any) => acc + 1, 1),
          share(),
          startWith(1),
        ),
        test: this.intent.test().pipe(
          scan((acc, next: any) => acc + 1, 1),
          share(),
          startWith(1),
        ),
        test2: this.subject.pipe(
          map(({ type, payload, states }) => {
            switch (type) {
              case 'subject-test':
                return payload + states.test2;
              default:
                return payload;
            }
          }),
          startWith(1),
        ),
      },
    };
  }
}

function testStore(
  observable: Observable<SubjectPayload<'test', number, { test2: number }>>,
  initialState: number,
) {
  return {
    view: observable.pipe(
      scan(
        (
          acc: number,
          args: SubjectPayload<'test', number, { test2: number }>,
        ) => {
          switch (args.type) {
            case 'test':
              return acc + 1;
            default:
              return acc;
          }
        },
        initialState,
      ),
      startWith(initialState),
    ),
  };
}

@store
class TestStore2 implements Store<{ view: { test3: Observable<number> } }> {
  private intent!: Intent;

  public initialize() {
    return {
      view: {
        test3: this.intent.test().pipe(
          scan((acc, next: any) => next.data, 1),
          share(),
          startWith(0),
        ),
      },
    };
  }
}

@store
class TestStore3 implements Store<{ view: { test: Observable<number> } }> {
  private intent!: Intent;

  private foo!: number;

  public initialize() {
    return {
      view: {
        test: this.intent.test().pipe(
          scan((acc, next: any) => acc + 1, this.foo),
          share(),
          startWith(this.foo),
        ),
      },
    };
  }
}

@intent
class Intent4 {
  private intent!: HandlerResponse;

  public test(): Observable<{}> {
    return this.intent.for<{}, {}>('on-click').pipe(share());
  }
}

@store
class TestStore4 implements Store<{ view: { test3: Observable<number> } }> {
  private intent!: Intent4;

  private foo!: number;

  public initialize() {
    return {
      view: {
        test3: this.intent.test().pipe(
          map(({ state }: any) => state.view.base + 1),
          startWith(0),
        ),
      },
    };
  }
}

const WAIT_TIME_MS = 200;
describe('factory.tsx', () => {
  const dispatched: WorkerPayload[] = [];
  beforeAll(() => {
    global['RECEIVE_WORKER_MESSAGE'] = ({ type, payload }) => {
      dispatched.push({ type, payload });
    };
  });

  afterEach(() => {
    dispatched.length = 0;
  });

  describe('makeView/makeApp', () => {
    it('should pass intent and store to children.', done => {
      const subject = run(
        {},
        {},
        {
          store: TestStore,
          intent: Intent,
        },
      );
      subject.next({ type: 'INITIALIZE', payload: {} });
      subject.next({
        type: 'DISPATCH',
        payload: { type: 'test', payload: 1 },
      });
      setTimeout(() => {
        assert.strictEqual(dispatched.length, 3);
        nodeAssert.deepStrictEqual(dispatched[0], {
          type: WorkerPostEventType.INITIALIZED,
          payload: {
            base: 1,
            test: 1,
            test2: 1,
          },
        });
        nodeAssert.deepStrictEqual(dispatched[1], {
          type: WorkerPostEventType.UPDATE,
          payload: {
            base: 2,
            test: 2,
            test2: 1,
          },
        });
        nodeAssert.deepStrictEqual(dispatched[2], {
          type: WorkerPostEventType.DISPATCHED,
          payload: { type: 'test', payload: 1 },
        });
        done();
      }, WAIT_TIME_MS);
    });

    it('should pass intent and store group to children.', done => {
      const subject = run(
        {},
        {},
        {
          store: [TestStore, TestStore2],
          intent: Intent,
        },
      );

      setTimeout(() => {
        subject.next({ type: 'INITIALIZE', payload: {} });
        subject.next({
          type: 'DISPATCH',
          payload: { type: 'test', payload: 1 },
        });
        setTimeout(() => {
          assert.strictEqual(dispatched.length, 3);
          nodeAssert.deepStrictEqual(dispatched[0], {
            type: WorkerPostEventType.INITIALIZED,
            payload: {
              base: 1,
              test: 1,
              test2: 1,
              test3: 0,
            },
          });
          nodeAssert.deepStrictEqual(dispatched[1], {
            type: WorkerPostEventType.UPDATE,
            payload: {
              base: 2,
              test: 2,
              test2: 1,
              test3: 1,
            },
          });
          nodeAssert.deepStrictEqual(dispatched[2], {
            type: WorkerPostEventType.DISPATCHED,
            payload: { type: 'test', payload: 1 },
          });
          done();
        }, WAIT_TIME_MS);
      });
    });

    it('should pass services', done => {
      const subject = run(
        {},
        {},
        {
          store: TestStore3,
          intent: Intent,
          service: { foo: 10 },
        },
      );
      subject.next({ type: 'INITIALIZE', payload: {} });
      subject.next({
        type: 'DISPATCH',
        payload: { type: 'test', payload: 1 },
      });
      setTimeout(() => {
        assert.strictEqual(dispatched.length, 3);
        nodeAssert.deepStrictEqual(dispatched[0], {
          type: WorkerPostEventType.INITIALIZED,
          payload: {
            test: 10,
          },
        });
        nodeAssert.deepStrictEqual(dispatched[1], {
          type: WorkerPostEventType.UPDATE,
          payload: {
            test: 11,
          },
        });
        nodeAssert.deepStrictEqual(dispatched[2], {
          type: WorkerPostEventType.DISPATCHED,
          payload: { type: 'test', payload: 1 },
        });
        done();
      }, WAIT_TIME_MS);
    });
  });
});
