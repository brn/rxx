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
  qs
} from '../qs';
import {
  expect
} from 'chai';


describe('qs', () => {
  it('should convert simple object to query string', () => {
    const ret = qs({ a: 1, b: 2, c: 3 });
    expect(ret).to.be.eq('a=1&b=2&c=3');
  });


  it('should convert nested object to query string', () => {
    const ret = qs({ a: 1, b: { c: 3 } });
    expect(ret).to.be.eq('a=1&b.c=3');
  });


  it('should convert date object to query string', () => {
    const date = Date.now();
    const ret = qs({ a: 1, b: date });
    expect(ret).to.be.eq(`a=1&b=${date}`);
  });
});
