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

import { Observable, of, combineLatest } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

type Instantiable<T = {}> = new (...args: any[]) => T;

/*tslint:disable:ban-types*/
type UnObservablifyField<T> = {
  [P in keyof T]: T[P] extends Observable<infer U>
    ? UnObservablify<U>
    : T[P] extends Function
      ? T[P]
      : T[P] extends RegExp
        ? T[P]
        : T[P] extends Date
          ? T[P]
          : T[P] extends Symbol
            ? T[P]
            : T[P] extends Boolean
              ? T[P]
              : T[P] extends String
                ? T[P]
                : T[P] extends Number
                  ? T[P]
                  : T[P] extends Instantiable<any>
                    ? T[P]
                    : T[P] extends Array<infer U>
                      ? UnObservablify<U>[]
                      : UnObservablify<T[P]>
};
/*tslint:enable:ban-types*/

export type UnObservablify<T> = T extends Observable<infer U>
  ? UnObservablifyField<U>
  : UnObservablifyField<T>;

function isObject(o): o is object {
  return (
    Object.prototype.toString.call(o) === '[object Object]' &&
    o.constructor === Object
  );
}
const { isArray } = Array;

type Injector<T> = (values: { [key: string]: any }) => UnObservablify<T>;
class Collector<T> {
  private code = 'const template = ';

  private observables: { key: string; observable: Observable<any> }[] = [];
  private values: { key: string; value: any }[] = [];
  private injector!: Injector<T>;
  private id = 0;

  public collect<U>(
    object: { [P in keyof U]: Observable<U[P]> | U[P] },
    startWithNull: boolean = false,
  ): Observable<UnObservablify<T>> {
    if (object instanceof Observable) {
      return object;
    }

    if (!isArray(Object) && !isObject(object)) {
      throw new Error('Invalid object passed to combineTemplate');
    }

    this.doCollect(object);
    this.initInjector();
    if (!this.observables.length) {
      return of(object) as Observable<any>;
    }

    return combineLatest(
      ...this.observables.map(({ observable }) => {
        const NULL_VALUE = {};
        let firstValue = NULL_VALUE;
        const sub = observable.subscribe(v => (firstValue = v));
        sub.unsubscribe();

        if (firstValue === NULL_VALUE && startWithNull) {
          return observable.pipe(startWith(null));
        }

        return observable;
      }),
    ).pipe(
      map(results => {
        const values = {};
        results.forEach((value, i) => {
          values[this.observables[i].key] = value;
        });

        this.values.forEach(({ key, value }) => (values[key] = value));

        return this.injector(values);
      }),
    );
  }

  private doCollect(object: any) {
    if (isObject(object)) {
      this.code += '{';
      for (const key in object) {
        const k = JSON.stringify(key);
        if (object[key] instanceof Observable) {
          this.code += `${k}: values[${++this.id}]`;
          this.observables.push({
            observable: object[key],
            key: String(this.id),
          });
        } else {
          this.code += `${k}: `;
          this.doCollect(object[key]);
        }
        this.code += ',';
      }
      this.sliceComma();
      this.code += '}';
    } else if (isArray(object)) {
      this.code += '[';
      object.forEach((o, i) => {
        if (o instanceof Observable) {
          this.code += `values[${++this.id}]`;
          this.observables.push({ observable: o, key: String(this.id) });
        } else {
          this.doCollect(o);
        }
        this.code += ',';
      });
      this.sliceComma();
      this.code += ']';
    } else {
      this.code += `values[${++this.id}]`;
      this.values.push({ value: object, key: String(this.id) });
    }
  }

  private sliceComma() {
    if (this.code.charAt(this.code.length - 1) === ',') {
      this.code = this.code.slice(0, this.code.length - 1);
    }
  }

  private initInjector() {
    this.code += '\n;return template;';
    this.injector = Function('values', this.code) as Injector<T>;
  }
}

export function combineTemplate<T>(
  object: T,
  startWithNull: boolean = true,
): Observable<UnObservablify<T>> {
  return new Collector<T>().collect(object, startWithNull);
}
