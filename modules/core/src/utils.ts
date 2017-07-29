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


const OBJECT_REGEXP = /\[object ([^\]]+)\]/;
const toStringClass = o => o ? Object.prototype.toString.call(o).match(OBJECT_REGEXP)[1] : 'null';


export function isDefined(obj: any): boolean {
  return obj !== undefined && obj !== null;
}

export function assign<T extends {}, U extends {}>(base: T, append: U): T & U {
  return { ...base as any, ...append as any } as any;
}

export function extend<T extends {}, U extends {}>(base: T, append: U): T & U {
  for (const key in append) {
    (base as any)[key] = append[key];
  }

  return base as any;
}

export function omit(obj: any, name: string | string[]) {
  const ret = {};
  const omits = typeof name === 'string' ? [name] : name;
  for (const key in obj) {
    if (omits.indexOf(key) === -1) {
      ret[key] = obj[key];
    }
  }

  return ret;
}

export function forIn<T>(obj: T, cb: (value: T[keyof T], key: string, values: T) => void) {
  for (const key in obj || {}) {
    cb(obj[key], key, obj);
  }
}

export function isObject(obj: any): obj is Object {
  return toStringClass(obj) === 'Object';
}

export function isArray(obj: any): obj is any[] {
  return toStringClass(obj) === 'Array';
}

export function isRegExp(obj: any): obj is RegExp {
  return toStringClass(obj) === 'RegExp';
}


export function filter<T>(obj: T[], cb: (e: T, key: number, all: T[]) => boolean): T[];
export function filter<T>(obj: T, cb: (e: T[keyof T], key: string, all: T) => boolean): T[keyof T][];
export function filter<T>(obj: T | T[], cb: (e: T[keyof T] | T, key: any, all: T | T[]) => boolean): T[keyof T][] | T[] {
  if (isArray(obj)) {
    return obj.filter(cb as any) as any;
  }
  const ret: any = [];
  for (const key in obj || {}) {
    if (cb(obj[key], key, obj)) {
      ret.push(obj[key]);
    }
  }

  return ret;
}

export function map<T, U>(obj: T[], cb: (e: T, key: number, all: T[]) => U): U[];
export function map<T, U>(obj: T, cb: (e: T[keyof T], key: string, all: T) => U): U[];
export function map<T, U>(obj: T | T[], cb: (e: T[keyof T] | T[], key: any, all: T | T[]) => U): U[] {
  if (isArray(obj)) {
    return obj.map(cb as any) as any;
  }
  const ret: any = [];
  for (const key in obj || {}) {
    ret.push(cb(obj[key], key, obj));
  }

  return ret;
}


export function some<T>(obj: T, cb: (value: T[keyof T], index: number | string, all: T) => boolean): boolean {
  if (isArray(obj)) {
    return obj.some(cb as any);
  } else if (isObject(obj)) {
    for (const key in obj || {}) {
      if (cb(obj[key], key, obj)) {
        return true;
      }
    }
  }

  return false;
}


export function every<T>(obj: T, cb: (value: T[keyof T], index: number | string, all: T) => boolean): boolean {
  if (isArray(obj)) {
    return obj.every(cb as any);
  } else if (isObject(obj)) {
    for (const key in obj || {}) {
      if (!cb(obj[key], key, obj)) {
        return false;
      }
    }
  }

  return true;
}


export function mapValues<T, U>(obj: T, cb: (value: T[keyof T], key: string, all: T) => U): { [key: string]: U } {
  const ret: any = {};
  for (const key in obj || {}) {
    ret[key] = cb(obj[key], key, obj);
  }

  return ret;
}

export function clone<T>(target: T): T {
  if (isObject(target)) {
    return { ...target as any };
  } else if (isArray(target)) {
    return (target as any).slice();
  }

  return target;
}


export function symbol(val: string) {
  return typeof Symbol === 'function' ? Symbol(val) : val;
}
