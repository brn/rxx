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


import {
  Observable
} from 'rx';
import {
  StorageIO,
  StorageOptions,
  SubjectStore,
  IOResponse,
  DOMStorage,
  StorageMethod,
  StorageType
} from '../io'
import * as Cookies from 'js-cookie';


export class CookieStorage implements DOMStorage {
  public put<T>(key: string, value: T, {options}: StorageOptions) {
    Cookies.set(key, value, options);
    return value;
  }


  public get<T>(key: string): T {
    return Cookies.get(key) as any;
  }


  public del(key: string): any {
    const ret = Cookies.get(key);
    Cookies.set(key, '', {expires: -1});
    return ret;
  }
}


export class LocalStorage implements DOMStorage {
  public constructor(private storage: Storage = localStorage) {}


  public put<T>(key: string, value: T, {options}: StorageOptions) {
    this.storage.setItem(key, JSON.stringify(value));
    return value;
  }


  public get<T>(key: string): T {
    return JSON.parse(this.storage.getItem(key));
  }


  public del(key: string): any {
    const ret = this.get(key);
    this.storage.removeItem(key);
    return ret;
  }
}


export class StorageFactory implements StorageIO {
  private store = new SubjectStore();

  private ioResponse: IOResponse;

  private storages = {
    [StorageType[StorageType.COOKIE]]: new CookieStorage(),
    [StorageType[StorageType.LOCAL_STORAGE]]: new LocalStorage(),
    [StorageType[StorageType.SESSION_STORAGE]]: new LocalStorage(sessionStorage)
  };


  public constructor() {
    this.ioResponse = new IOResponse(this.store);
  }


  public wait(ob: Observable<StorageOptions>): void {
    ob.subscribe(v => {
      const type = StorageType[v.type];
      if (type && this.storages[type]) {
        const method = StorageMethod[v.method];
        if (!method) return;
        const subjects = this.store.get(v.key);
        subjects.forEach(subject => subject.onNext(this.storages[v.type][method.toLowerCase()](v.name || v.key, v.value, v.options)));
      }
    })
  }


  public get response() {return this.ioResponse;}
}
