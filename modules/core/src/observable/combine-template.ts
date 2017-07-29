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


import {
  Observable,
} from 'rxjs/Rx';
import {
  isArray,
  isObject
} from '../utils';


type ObservableSite = { context: any; key: string | number; value: Observable<any> };


class ObservableUpdater {
  private observables: ObservableSite[] = [];

  private clone: any;

  private doNotCollectObservables = false;

  private currentIndex = 0;

  private id = Date.now();

  private templateObject;


  private push(observable: ObservableSite) {
    if (!this.doNotCollectObservables) {
      this.observables.push(observable);
    } else {
      this.observables[this.currentIndex++].context = observable.context;
    }
  }


  public mapObservablesToValue() {
    if (!this.observables.length) {
      return Observable.of(this.templateObject);
    }

    return Observable.combineLatest(...this.observables.map(({ value }) => {
      const NULL_VALUE = {};
      let firstValue = NULL_VALUE;
      const sub = value.subscribe(v => firstValue = v);
      sub.unsubscribe();

      if (firstValue === NULL_VALUE) {
        return value.startWith(null);
      }

      return value;
    })).map(values => {
      values.forEach((value, index) => {
        const { context, key } = this.observables[index];
        context[key] = value;
      });
      const id = this.id = Date.now();
      let persisted = false;

      return typeof Proxy === 'function' ? new Proxy(this.clone, {
        get: (target, name) => {
          if (name === 'persist') {
            return () => {
              persisted = true;
              this.collect(this.templateObject);
            };
          }

          if (!persisted && id !== this.id) {
            console.warn(new Error(`State object is reused for performance.
If you want to use state object after updated, call persist().`).stack);
          }

          return target[name];
        }
      }) : (() => {
        return Object.defineProperty(this.clone, 'persist', {
          value: () => { this.collect(this.templateObject); },
          configurable: true,
          enumerable: false,
          writable: true
        });
      })();
    });
  }

  public collect<T>(object: {[P in keyof T]: Observable<P> | P}): void {
    this.templateObject = object;
    if (isArray(object)) {
      this.clone = object.slice();
    } else if (isObject(object) && Object.getPrototypeOf(object) === Object.prototype) {
      this.clone = { ...object as Object };
    } else {
      throw new Error('Invalid object passed to combineTemplate');
    }
    this.doCollectObservable(object, this.clone);
    this.doNotCollectObservables = true;
    this.currentIndex = 0;
  }


  private doCollectObservable<T>(object: {[P in keyof T]: Observable<P> | P}, clone: any): void {
    if (isArray(object)) {
      for (let i = 0, len = object.length; i < len; i++) {
        this.doFindObservable(object, i, clone);
      }
    } else if (isObject(object) && Object.getPrototypeOf(object) === Object.prototype) {
      for (const key in object) {
        this.doFindObservable(object, key, clone);
      }
    } else {
      throw new Error('Invalid object passed to combineTemplate');
    }
  }


  private doFindObservable(base: any, key: string | number, context: any) {
    const value = base[key];
    if (value instanceof Observable) {
      this.push({ context, key, value });
      context[key] = value;
    } else if (isArray(value)) {
      context[key] = value.slice();
      this.doCollectObservable(base[key], context[key]);
    } else if (isObject(value) && Object.getPrototypeOf(value) === Object.prototype) {
      context[key] = { ...value };
      this.doCollectObservable(base[key], context[key]);
    } else {
      context[key] = value;
    }
  }

}


export function combineTemplate<T>(object: T): Observable<T & { persist(): void }> {
  const updater = new ObservableUpdater();
  updater.collect(object);

  return updater.mapObservablesToValue() as any;
}
