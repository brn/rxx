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

import { MethodInvocation } from '../advice';
import { combineAdvice } from '../combine-advice';
import { generateIntentHandler } from '../../intent/intent-handler';
import { Intent } from '../../intent/intent';
import { expect } from 'chai';
import { SubjectTree } from '../../subject';
import { connectDevTools } from '../../devtools';

describe('combine-advice.ts', () => {
  describe('combineAdvice', () => {
    it('should combine all advices', async () => {
      let called = false;
      const result = [];
      const mi = new MethodInvocation(
        function() {
          called = true;
        },
        1,
        [],
        '',
        '',
      );
      const advice1 = (mi: MethodInvocation) => {
        result.push('advice1');
        mi.proceed();
      };

      const advice2 = (mi: MethodInvocation) => {
        result.push('advice2');
        mi.proceed();
      };
      const ih = generateIntentHandler(
        new Intent(null),
        new SubjectTree(connectDevTools({ name: '', instanceId: '' }), null),
      );

      await combineAdvice(advice1, advice2)(mi, ih);
      expect(result).to.be.deep.equal(['advice1', 'advice2']);
    });
  });
});
