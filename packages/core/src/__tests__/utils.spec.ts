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
  isDefined,
  isArray,
  isObject,
  isRegExp,
  assign,
  extend,
  omit,
  forIn,
  filter,
  map,
  some,
  every,
  mapValues,
  clone
} from '../utils';
import {
  expect
} from 'chai';


describe('utils', () => {
  describe('isDefined', () => {
    it('should return false if value is undefined or null', () => {
      expect(isDefined(null)).to.be.eq(false);
      expect(isDefined(undefined)).to.be.eq(false);
      expect(isDefined(NaN)).to.be.eq(true);
      expect(isDefined(Infinity)).to.be.eq(true);
      expect(isDefined(0)).to.be.eq(true);
      expect(isDefined([])).to.be.eq(true);
      expect(isDefined('')).to.be.eq(true);
    });
  });

  describe('isDefined', () => {
    it('should return true if value is array', () => {
      expect(isArray([])).to.be.eq(true);
      expect(isArray(new Array())).to.be.eq(true);
      expect(isArray({})).to.be.eq(false);
      expect(isArray(1)).to.be.eq(false);
      expect(isArray(() => { })).to.be.eq(false);
    });
  });

  describe('isObject', () => {
    it('should return true if value is object', () => {
      expect(isObject({})).to.be.eq(true);
      expect(isObject(new Object())).to.be.eq(true);
      expect(isObject([])).to.be.eq(false);
      expect(isObject(1)).to.be.eq(false);
      expect(isObject(() => { })).to.be.eq(false);
    });
  });

  describe('isRegExp', () => {
    it('should return true if value is RegExp', () => {
      expect(isRegExp(/a/)).to.be.eq(true);
      expect(isRegExp(new RegExp('a'))).to.be.eq(true);
      expect(isRegExp([])).to.be.eq(false);
      expect(isRegExp(1)).to.be.eq(false);
      expect(isRegExp(() => { })).to.be.eq(false);
    });
  });

  describe('assign', () => {
    it('should merge two object with shallow and return new object.', () => {
      const a = { a: 1 };
      const b = { b: 1 };
      const ab = assign(a, b);

      expect(ab).to.be.deep.eq({ a: 1, b: 1 });
      expect(ab).to.be.not.eq(a);
      expect(ab).to.be.not.eq(b);
    });


    it('should overwrite same key property', () => {
      const a = { a: 1, b: { c: 1 } };
      const b = { a: 1, b: { d: 1 } };
      const ab = assign(a, b);

      expect(ab).to.be.deep.eq({ a: 1, b: { d: 1 } });
      expect(ab).to.be.not.eq(a);
      expect(ab).to.be.not.eq(b);
    });
  });


  describe('extend', () => {
    it('should extend first arguments by seconds arguments', () => {
      const a = { a: 1 };
      const b = { b: 1 };
      const ab = extend(a, b);

      expect(ab).to.be.deep.eq({ a: 1, b: 1 });
      expect(ab).to.be.eq(a);
      expect(ab).to.be.not.eq(b);
    });


    it('should overwrite same key property', () => {
      const a = { a: 1, b: { c: 1 } };
      const b = { a: 1, b: { d: 1 } };
      const ab = extend(a, b);

      expect(ab).to.be.deep.eq({ a: 1, b: { d: 1 } });
      expect(ab).to.be.eq(a);
      expect(ab).to.be.not.eq(b);
    });
  });

  describe('omit', () => {
    it('should omit specified key', () => {
      const a = { a: 1, b: 2, c: 3 };
      const ab = omit(a, 'c');

      expect(ab).to.be.deep.eq({ a: 1, b: 2 });
      expect(ab).to.be.not.eq(a);
    });


    it('should overwrite same key property', () => {
      const a = { a: 1, b: 2, c: 3 };
      const ab = omit(a, ['b', 'c']);

      expect(ab).to.be.deep.eq({ a: 1 });
      expect(ab).to.be.not.eq(a);
    });
  });

  describe('forIn', () => {
    it('should iterator over object with key and value', () => {
      const a = { a: 1, b: 2, c: 3 };
      const b = {};
      forIn(a, (v, k) => b[k] = v);
      expect(b).to.be.deep.eq(a);
    });
  });


  /*tslint:disable:no-magic-numbers*/
  describe('filter', () => {
    it('should filter array.', () => {
      const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const b = filter(a, v => v % 2 === 0);
      expect(b).to.be.deep.eq([2, 4, 6, 8, 10]);
    });

    it('should filter object.', () => {
      const a = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
      const b = filter(a, v => v % 2 === 0);
      expect(b).to.be.deep.eq([2, 4, 6, 8, 10]);
    });
  });

  describe('map', () => {
    it('should map array.', () => {
      const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const b = map(a, v => v * 2);
      expect(b).to.be.deep.eq([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    });

    it('should map object.', () => {
      const a = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
      const b = map(a, v => v * 2);
      expect(b).to.be.deep.eq([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    });
  });

  describe('some', () => {
    it('should iterator array and return true if one of callback return true.', () => {
      const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const b = some(a, v => v === 5);
      const c = some(a, v => v === 11);
      expect(b).to.be.eq(true);
      expect(c).to.be.eq(false);
    });

    it('should iterator object and return true if one of callback return true.', () => {
      const a = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
      const b = some(a, v => v === 5);
      const c = some(a, v => v === 11);
      expect(b).to.be.eq(true);
      expect(c).to.be.eq(false);
    });
  });

  describe('every', () => {
    it('should iterator array and return true if all callback return true.', () => {
      const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const b = every(a, v => true);
      const c = every(a, v => v === 5);
      expect(b).to.be.eq(true);
      expect(c).to.be.eq(false);
    });

    it('should iterator object and return true if all callback return true.', () => {
      const a = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
      const b = every(a, v => true);
      const c = every(a, v => v === 5);
      expect(b).to.be.eq(true);
      expect(c).to.be.eq(false);
    });
  });

  describe('mapValues', () => {
    it('should iterator object and return object that has mapped value', () => {
      const a = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
      const b = mapValues(a, v => v * 2);
      expect(b).to.be.deep.eq({ a: 2, b: 4, c: 6, d: 8, e: 10, f: 12, g: 14, h: 16, i: 18, j: 20 });
    });
  });


  describe('clone', () => {
    it('should shallow clone array', () => {
      const a = [1, 2, 3, 4, 5];
      const b = clone(a);
      expect(b).to.be.deep.eq(a);
      expect(b).to.be.not.eq(a);
    });

    it('should shallow clone object', () => {
      const a = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const b = clone(a);
      expect(b).to.be.deep.eq(a);
      expect(b).to.be.not.eq(a);
    });
  });
  /*tslint:enable:no-magic-numbers*/
});
