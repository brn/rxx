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
  Observable,
  Subject,
  Subscription
} from 'rxjs/Rx';
import {
  mapValues,
  forIn,
  isArray,
  omit,
  every
} from '../utils';
import {
  Advice,
  AdviceFunction,
  MethodInvocation
} from './advice';

/**
 * Typedef for State handler map.
 */
export type StateHandlerMap = { [key: string]: Handler };


/**
 * StateHandler Registry.
 */
let stateHandlerRegistry: StateHandlerMap = {};


/**
 * Get registered stateHandlerRegistry.
 */
export function getHandlers(): StateHandlerMap {
  return stateHandlerRegistry;
}


/**
 * Register StateHandler to handler map.
 * @param newHandlers Handler map.
 */
export function registerHandlers(newHandlers: StateHandlerMap) {
  let invalidTargetKey = '';

  if (!every(newHandlers, (h, k: string) => {
    const result = h instanceof StateHandler;
    if (!result) {
      invalidTargetKey = k;
    }

    return result;
  })) {
    throw new Error(`${invalidTargetKey} is not valid state handler.`);
  }
  stateHandlerRegistry = {
    ...stateHandlerRegistry,
    ...newHandlers
  };
}


/**
 * Remove specified handler from registry.
 * @param key Key or keys of target handler.
 */
export function removeHandler(key: string | string[]) {
  stateHandlerRegistry = omit(stateHandlerRegistry, key);
}


/**
 * Represent StateHandler response.
 */
export class HandlerResponse {
  public constructor(private streamCollection: StreamCollection) { }


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


export interface StreamCollection {
  /**
   * Check whether Subject was defined with specific key that except global key or not.
   * @param key Subject name.
   * @return True if Subject was defined.
   */
  hasWithoutGlobal(key: string): boolean;

  /**
   * Check whether Subject was defined with specific key or not.
   * @param key Subject name.
   * @return True if Subject was defined.
   */
  has(key: string): boolean;

  /**
   * Get Subject by specific key that except global key.
   * @param key Subject name.
   * @returns Registered Subject.
   */
  getWithoutGlobal(key: string): Subject<any>;

  /**
   * Get Subject by specific key.
   * @param key Subject name.
   * @returns Registered Subject.
   */
  get(key: string): Subject<any>[];

  /**
   * Append new Subject.
   * @param key Subject name.
   * @returns Registered Subject.
   */
  add<T>(key: string): Subject<T>;
}


/**
 * Hold Subject cache.
 */
export class StreamStore implements StreamCollection {
  constructor(private subjectMap: { [key: string]: Subject<any> } = {}) { }


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
    const splited = key.split('::');
    const globalKey = splited.length > 1 ? `*::${splited[1]}` : null;

    return !!this.subjectMap[key] || (globalKey ? !!this.subjectMap[globalKey] : false);
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
  public get(key: string): Subject<any>[] {
    const ret = [];
    const splited = key.split('::');
    const globalKey = splited.length > 1 ? `*::${splited[1]}` : null;
    const globalBus = globalKey && this.subjectMap[globalKey] ? this.subjectMap[globalKey] : null;
    if (this.subjectMap[key]) {
      ret.push(this.subjectMap[key]);
    }
    if (globalBus) {
      ret.push(globalBus);
    }

    return ret;
  }


  /**
   * @inheritDoc
   */
  public add<T>(key: string): Subject<T> {
    return this.subjectMap[key] = new Subject<T>();
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
  callback(key: string, value?: any): (args?: any) => void;


  /**
   * State setter by Provisioning.
   */
  setState(state: any): void;
}


export type Advices = { [key: string]: Advice | AdviceFunction };

export type CutPoints = { [key: string]: string | string[] };


export type StateHandlerData<Value, State> = { data: Value; state: State };


export abstract class StateHandler implements Handler {
  /**
   * Subject for exported stream.
   */
  protected readonly store = new StreamStore();

  /**
   * Response of streams.
   */
  private readonly handlerResponse: HandlerResponse;


  protected state: any;


  public setState(state: any) {
    this.state = state;
  }


  public constructor(advices: Advices = {}, cutPoints: CutPoints = {}) {
    this.handlerResponse = new HandlerResponse(this.store);
    forIn(advices, (advice, name) => {
      let cutPoint = cutPoints[name];
      cutPoint = isArray(cutPoint) ? cutPoint : [cutPoint];
      if (!cutPoint) {
        throw new Error(`Cut point ${name} does not exists`);
      }
      cutPoint.forEach(name => {
        if (typeof this[name] !== 'function') {
          throw new Error('Advice only applyable to Function.');
        }
        const method = this[name];
        this[name] = (...args) => {
          const proceed = () => method.apply(this, args);
          const mi = new MethodInvocation(proceed, this, args, this.constructor.name, name);

          /*tslint:disable:no-string-literal*/
          return advice['invoke'] ? (advice as Advice).invoke(mi) : (advice as AdviceFunction)(mi);
          /*tslint:enable:no-string-literal*/
        };
      });
    });
  }


  /**
   * @inheritDocs
   */
  public abstract subscribe(props: { [key: string]: any }): Subscription;


  /**
   * Return response representation of stream.
   * @return Representation of stream response.
   */
  public get response() {
    return this.handlerResponse;
  }


  /**
   * @inheritDocs
   */
  public abstract push(key: string, args?: any);


  /**
   * @inheritDocs
   */
  public callback(key: string, value?: any) {
    return (key: string, args?: any) => this.push(key, value !== undefined ? value : args);
  }
}
