// -*- mode: typescript -*-
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


/**
 * Constructor function definitions.
 */
export interface ClassType<T> {
  new (a: any): T;
  new (a: any, b: any): T;
  new (a: any, b: any, c:any): T;
  new (a: any, b: any, c:any, d:any): T;
  new (a: any, b: any, c:any, d:any, e:any): T;
  new (a: any, b: any, c:any, d:any, e:any, f:any): T;
  new (a: any, b: any, c:any, d:any, e:any, f:any, g:any): T;
  new (a: any, b: any, c:any, d:any, e:any, f:any, g:any, h:any): T;
  new (a: any, b: any, c:any, d:any, e:any, f:any, g:any, h:any, i:any): T;
  new (a: any, b: any, c:any, d:any, e:any, f:any, g:any, h:any, i:any, j:any): T;
  new (a: any, b: any, c:any, d:any, e:any, f:any, g:any, h:any, i:any, j:any, k:any): T;
  new (a: any, b: any, c:any, d:any, e:any, f:any, g:any, h:any, i:any, j:any, k:any, l:any): T;
  new (a: any, b: any, c:any, d:any, e:any, f:any, g:any, h:any, i:any, j:any, k:any, l:any, m:any): T;
  new (a: any, b: any, c:any, d:any, e:any, f:any, g:any, h:any, i:any, j:any, k:any, l:any, m:any, n:any): T;
  new (a: any, b: any, c:any, d:any, e:any, f:any, g:any, h:any, i:any, j:any, k:any, l:any, m:any, n:any, o:any): T;
  new (a: any, b: any, c:any, d:any, e:any, f:any, g:any, h:any, i:any, j:any, k:any, l:any, m:any, n:any, o:any, p:any): T;
  new (a: any, b: any, c:any, d:any, e:any, f:any, g:any, h:any, i:any, j:any, k:any, l:any, m:any, n:any, o:any, p:any, q:any): T;
}
