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
}             from 'rxjs/Observable';
import {
  Subject
}             from 'rxjs/Subject';
import {
  Subscription
}             from 'rxjs/Subscription';
import {
  Symbol
}             from '../shims/symbol';
import {
  _
}             from '../shims/lodash';


export const IO_MARK = Symbol('io');


/**
 * Decorator for io module.
 */
export function io<T extends Function>(target: T) {
  target[IO_MARK] = true;
}


/**
 * Represent IO response.
 */
export class IOResponse {
  public constructor(private subjectStore: SubjectStore) {};


  /**
   * Get a subject by specify key.
   * @param key Subject name.
   * @returns Registered Subject.
   */
  public for<T>(key: string): Observable<T> {
    if (!this.subjectStore.hasWithoutGlobal(key)) {
      return this.subjectStore.add<T>(key);
    }
    return this.subjectStore.getWithoutGlobal(key);
  }
}


/**
 * Hold Subject cache.
 */
export class SubjectStore {

  constructor(private subjectMap: {[key: string]: Subject<any>} = {}) {}


  public hasWithoutGlobal(key: string) {
    return !!this.subjectMap[key];
  }


  /**
   * Check whether Subject was defined with specific key or not.
   * @param key Subject name.
   * @return True if Subject was defined.
   */
  public has(key: string) {
    const splited = key.split('::');
    const globalKey = splited.length > 1? `*::${splited[1]}`: null;
    return this.subjectMap[key] || (globalKey? this.subjectMap[globalKey]: false);
  }


  public getWithoutGlobal(key: string): Subject<any> {
    if (this.subjectMap[key]) {
      return this.subjectMap[key];
    }
    return null;
  }


  /**
   * Get Subject by specific key.
   * @param key Subject name.
   * @returns Registered Subject.
   */
  public get(key: string): Subject<any>[] {
    const ret = [];
    const splited = key.split('::');
    const globalKey = splited.length > 1? `*::${splited[1]}`: null;
    const globalBus = globalKey && this.subjectMap[globalKey]? this.subjectMap[globalKey]: null;
    if (this.subjectMap[key]) {
      ret.push(this.subjectMap[key]);
    }
    if (globalBus) {
      ret.push(globalBus);
    }
    return ret;
  }


  /**
   * Append new Subject.
   * @param key Subject name.
   * @returns Registered Subject.
   */
  public add<T>(key: string): Subject<T> {
    return this.subjectMap[key] = new Subject<T>();
  }
}


/**
 * Interface for IO processor.
 */
export interface IO {
  response: IOResponse;
  /**
   * Wait observable.
   * @param request Disposable.
   */
  subscribe(props: {[key: string]: any}): Subscription;

  /**
   * Publish specified key io event.
   * @param key Event name.
   * @param args Event args.
   */
  push(key: string, args?: any): void;


  /**
   * Get callback function that publish specified key event.
   * @param key Event name.
   * @param v Event args that override event args.
   * @returns Function that publish event.
   */
  callback(key: string, value?: any): (args?: any) => void;
}


export abstract class Outlet implements IO {
  protected store = new SubjectStore();
  private ioResponse: IOResponse;


  public constructor() {
    this.ioResponse = new IOResponse(this.store);
  }


  public abstract subscribe(props: {[key: string]: any}): Subscription;


  public get response() {
    return this.ioResponse;
  }


  public abstract push(key: string, args?: any);


  public abstract callback(key: string, value?: any);
}


export interface BasicIOTypes {http: IO, event: IO, storage: IO};
