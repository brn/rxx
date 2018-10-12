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

import { Observable, Subject, Subscription } from 'rxjs';
import { mapValues, forIn, isArray, omit, every } from '../utils';
import { StreamCollection } from './stream-collection';
import { Advice, AdviceFunction } from './advice';
import { IntentHandler } from '../intent/intent-handler';
import { SubjectTree } from '../subject';

/**
 * Represent StateHandler response.
 */
export class HandlerResponse {
  public constructor(private streamCollection: StreamCollection) {}

  /**
   * Get a subject by specify key.
   * @param key Subject name.
   * @returns Registered Subject.
   */
  public for<T, V>(key: string): Observable<StateHandlerData<T, V>> {
    if (!this.streamCollection.hasWithoutGlobal(key)) {
      return this.streamCollection.add<StateHandlerData<T, V>>(key);
    }

    return this.streamCollection.getWithoutGlobal(key);
  }
}

/**
 * Hold Subject cache.
 */
export class StreamStore implements StreamCollection {
  constructor(private subjectMap: { [key: string]: Subject<any> } = {}) {}

  /**
   * @inheritDoc
   */
  public hasWithoutGlobal(key: string) {
    return !!this.subjectMap[key];
  }

  /**
   * @inheritDoc
   */
  public has(key: string): boolean {
    return this.get(key).length > 0;
  }

  /**
   * @inheritDoc
   */
  public getWithoutGlobal(key: string): Subject<any> {
    if (this.subjectMap[key]) {
      return this.subjectMap[key];
    }

    return null;
  }

  /**
   * @inheritDoc
   */
  public get(keySpace: string, create: boolean = false): Subject<any>[] {
    const ret = [];
    const [ns, key] = keySpace.split('::');
    const globalKeys = [`*::${key}`, `${ns}::*`];
    const globalBus = globalKeys
      .filter(key => !!this.subjectMap[key])
      .map(key => this.subjectMap[key]);
    if (this.subjectMap[keySpace]) {
      ret.push(this.subjectMap[keySpace]);
    } else if (create) {
      ret.push(this.add(keySpace));
    }

    if (globalBus.length) {
      return ret.concat(globalBus);
    }

    return ret;
  }

  /**
   * @inheritDoc
   */
  public add<T>(key: string): Subject<T> {
    return (this.subjectMap[key] = new Subject<T>());
  }
}

/**
 * Interface for state handler.
 */
export interface Handler {
  response: HandlerResponse;
  /**
   * Wait observable.
   * @param request Disposable.
   */
  subscribe(props: { [key: string]: any }): Subscription;

  /**
   * Publish specified key io event.
   * @param key Event name.
   * @param args Event args.
   */
  push(key: string, args?: any): Promise<any>;

  /**
   * Get callback function that publish specified key event.
   * @param key Event name.
   * @param v Event args that override event args.
   * @returns Function that publish event.
   */
  callback<Args, ReturnType>(
    key: string,
    value?: any,
  ): (args?: Args) => Promise<ReturnType>;

  /**
   * State setter by Provisioning.
   */
  setState(state: any): void;

  setSubject(subject: SubjectTree): void;

  setIntent(intent: IntentHandler): void;

  clone<T = Handler>(...args: any[]): Handler;

  readonly intent: IntentHandler;
}

export type Advices = { [key: string]: Advice | AdviceFunction };

export type CutPoints = { [key: string]: string | string[] };

export type StateHandlerData<Value, State> = { data: Value; state: State };
