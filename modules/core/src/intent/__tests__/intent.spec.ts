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
import {
  graceful
} from '@react-mvi/testing';
import {
  Intent
} from '../intent';
import {
  expect
} from 'chai';


describe('intent.ts', () => {
  describe('Intent', () => {
    describe('#push()', () => {
      it('should dispatch event.', () => {
        const intent = new Intent();
        intent.setState(null);
        let fired;
        const disp = intent.response.for<boolean, {}>('test').subscribe(v => {
          fired = v;
        });
        intent.push('test', true);
        expect(fired).to.be.deep.eq({ data: true, state: null });
        disp.unsubscribe();
      });


      it('should dispatch parent and children event.', () => {
        const grandp = new Intent();
        const parent = new Intent(grandp);
        const intent = new Intent(parent);
        const child = new Intent(intent);
        const grandc = new Intent(child);

        const result = [];

        grandp.response.for('test').subscribe(v => {
          result.push('grandp');
        });
        parent.response.for('test').subscribe(v => {
          result.push('parent');
        });
        intent.response.for('test').subscribe(v => {
          result.push('main');
        });
        child.response.for('test').subscribe(v => {
          result.push('child');
        });
        grandc.response.for('test').subscribe(v => {
          result.push('grandc');
        });

        intent.push('test');

        expect(result).to.be.deep.eq([
          'main',
          'parent',
          'grandp',
          'child',
          'grandc'
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
        expect(fired).to.be.deep.eq({ data: true, state: null });
        disp.unsubscribe();
      });
    });
  });
});
