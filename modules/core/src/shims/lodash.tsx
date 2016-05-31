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

/// <reference path="../declarations.d.ts"/>


import * as lodash from 'lodash';


export interface Lodash {
  forEach<T>(a: T[], cb: (v: T, i?: number, a?: T[]) => any): void;
  forEach<T>(a: {[key: string]: T}, cb: (v: T, k?: string, a?: {[key: string]: T}) => any): void;
  forEach<T>(a: T, cb: (v: T, i?: string, a?: T) => any): void;
  every<T>(a: T[], cb: (v: T, i?: number, a?: T[]) => boolean): boolean;
  forIn<T>(a: {[key: string]: T}, cb: (v: T, k?: string, a?: {[key: string]: T}) => any): void;
  forIn<T, U>(a: T, cb: (v: U, k?: string, a?: T) => any): void;
  map<T, U>(a: T[], cb: (v: T, i?: number, a?: T[]) => U): U[];
  map<T, U>(a: {[key: string]: T}, cb: (v: T, k?: string, a?: {[key: string]: T}) => U): U[];
  filter<T>(a: T[], cb: (v: T, i?: number, a?: T[]) => boolean): T[];
  filter<T, U>(a: T, cb: (v: U, i?: string, a?: T) => boolean): T;
  mapValues<T, V>(a: {[key: string]: T}, cb: (v: T, k?: string, a?: {[key: string]: T}) => V): {[key: string]: V}
  isArray(v: any): v is any[];
  isObject(v: any): boolean;
  clone<T>(v: T): T;
  omit<T>(v: T, prop: string): T;
  assign<A, B>(v: A, s: B): A & B;
  extend<A, B>(v: A, s: B): A & B;
  isNil(v: any): boolean;
  isRegExp(v: any): v is RegExp;
  keys(v: any): string[]
}

export const _: Lodash = lodash as any;
