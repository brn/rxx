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
  MethodInvocation
} from '../advice';
import {
  expect
} from 'chai';


describe('advice.ts', () => {
  describe('MethodInvocation', () => {
    describe('#proceed()', () => {
      it('should call advices method.', () => {
        const mi = new MethodInvocation(function() { return this; }, 1, [], '', '');
        expect(mi.proceed()).to.be.eq(1);
      });

      it('should arguments passed.', () => {
        const mi = new MethodInvocation((a, b) => a + b, {}, ['a', 'b'], '', '');
        expect(mi.proceed()).to.be.eq('ab');
      });
    });

    describe('#getArguments()', () => {
      it('should return arguments list', () => {
        const mi = new MethodInvocation(() => { }, {}, ['a', 'b'], '', '');
        expect(mi.getArguments()).to.be.deep.eq(['a', 'b']);
      });
    });

    describe('#getContext()', () => {
      it('should return context object', () => {
        const context = {};
        const mi = new MethodInvocation(() => { }, context, ['a', 'b'], '', '');
        expect(mi.getContext()).to.be.eq(context);
      });
    });

    describe('#getInstanceName()', () => {
      it('should return class instance name.', () => {
        const mi = new MethodInvocation(() => { }, {}, ['a', 'b'], 'test', '');
        expect(mi.getInstanceName()).to.be.eq('test');
      });
    });

    describe('#getPropertyName()', () => {
      it('should return property name.', () => {
        const mi = new MethodInvocation(() => { }, {}, ['a', 'b'], 'test', 'test');
        expect(mi.getPropertyName()).to.be.eq('test');
      });
    });

    describe('#getFullQualifiedName()', () => {
      it('should return full qualified property name..', () => {
        const mi = new MethodInvocation(() => { }, {}, ['a', 'b'], 'test', 'test');
        expect(mi.getFullQualifiedName()).to.be.eq('test.test');
      });
    });
  });
});
