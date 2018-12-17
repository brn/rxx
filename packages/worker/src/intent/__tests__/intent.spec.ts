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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */

import 'core-js';
import { Intent } from '../intent';
import assert from 'power-assert';
import nodeAssert from 'assert';

describe('intent.ts', () => {
  describe('Intent', () => {
    describe('#push()', () => {
      it('should dispatch event.', () => {
        const intent = new Intent();
        intent.setState(null);
        let fired;
        const disp = intent.response!.for<boolean, {}>('test').subscribe(v => {
          fired = v;
        });
        intent.push('test', true);
        nodeAssert.deepStrictEqual(fired, { data: true, state: null });
        disp.unsubscribe();
      });
    });
    describe('#subscribeEvent()', () => {
      it('should dispatch subscriber.', () => {
        const intent = new Intent();
        let called = false;
        intent.subscribeEvent(() => {
          called = true;
        });
        intent.response.for('test').subscribe(() => {});

        intent.push('test');

        assert.ok(called);
      });

      it('should dispatch if RETRY dispatched.', () => {
        const intent = new Intent();
        const results: string[] = [];
        intent.subscribeEvent(type => {
          results.push(type);
        });

        intent.response.for('test-gp').subscribe(() => {});
        intent.response.for('test-p').subscribe(() => {});
        intent.response.for('test').subscribe(() => {});
        intent.response.for('test-c').subscribe(() => {});
        intent.response.for('test-gc').subscribe(() => {});

        intent.push('test-gp');
        intent.push('test-p');
        intent.push('test');
        intent.push('test-c');
        intent.push('test-gc');

        intent.push('RETRY', 'test-gp');
        intent.push('RETRY', 'test-p');
        intent.push('RETRY', 'test');
        intent.push('RETRY', 'test-c');
        intent.push('RETRY', 'test-gc');

        nodeAssert.deepStrictEqual(results, [
          'test-gp',
          'test-p',
          'test',
          'test-c',
          'test-gc',
          'test-gp',
          'test-p',
          'test',
          'test-c',
          'test-gc',
        ]);
      });
    });

    describe('#callback()', () => {
      it('should return event dispatching callback.', () => {
        const intent = new Intent();
        intent.setState(null);
        let fired;
        const disp = intent.response.for<boolean, {}>('test').subscribe(v => {
          fired = v;
        });
        intent.callback('test', true)();
        nodeAssert.deepStrictEqual(fired, { data: true, state: null });
        disp.unsubscribe();
      });
    });
  });
});
