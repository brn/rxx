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

import { Subscription, Subject, Observable } from 'rxjs';
import { StoreConstructor, Store, StateFactory } from './store/store';
import { Intent, IntentClass, IntentConstructor } from './intent/intent';
import { HandlerResponse, Handler } from './handler/handler';
import { getHandlers, StateHandler } from './handler/state-handler';
import { forIn, isArray, mapValues, mergeDeep } from './utils';
import { combineTemplate } from './observable/combine-template';
import { SubjectTree } from './subject';
import { SystemEvent } from './reducer';

/**
 * Type definition of state which created by StoreGroup.
 */
export interface StoreGroupState {
  [key: string]: any;
}

/**
 * Group of stores.
 * That merge multiple store state to one monolithic state.
 */
class StoreGroup implements Store<StoreGroupState> {
  private storeInstances: Store<any>[] = [];

  constructor(
    private intent: { [key: string]: IntentClass },
    private stores: StoreConstructor<any, any>[],
    private service: { [key: string]: any },
    private subject: SubjectTree,
  ) {}

  /**
   * @returns Merged state.
   */
  public initialize() {
    return this.stores.reduce(
      (state, Store) => {
        const store = new Store(
          this.intent,
          this.service,
          this.subject.observable,
        );
        const nextState = store.initialize!();
        this.storeInstances.push(store);
        if (nextState.view) {
          state.view = mergeDeep(state.view, nextState.view);
        }
        for (const key in nextState) {
          if (key !== 'view') {
            if (!nextState[key] || !(nextState[key] instanceof Observable)) {
              throw new Error(`Property ${key} must be Observable.`);
            }
            if (state[key]) {
              state[key] = state[key].merge(nextState[key]);
            } else {
              state[key] = nextState[key];
            }
          }
        }

        return state;
      },
      { view: {} },
    );
  }

  public getStores() {
    return this.storeInstances;
  }
}

const BUFFERING_TIME = 10;
export class Provisioning {
  private subscription!: Subscription | null;

  private intent!: Intent;

  private subject!: SubjectTree;

  private isDisposed = false;

  private handlerSubscriptions: Subscription[] = [];

  private unobservablifiedState: any;

  private subscribers: ((state: any) => void)[] = [];

  private state: any;

  private handlers: { [key: string]: Handler } = {};

  private cache: {
    storeGroup: StoreGroup;
    stores: Store<any>[];
    intentInstance: any;
    /**
     * Initial state created by store.
     */
    storeState: StoreGroupState;
  } | null = null;

  constructor(
    private intentConstructors: { [key: string]: IntentConstructor },
    private storeConstructors: StoreConstructor<any, any>[],
    private stateFactory: StateFactory = (_, a) => a,
    private service: { [key: string]: any } = {},
    private stateHandlers: { [key: string]: StateHandler } = {},
    private intentAdvice: (intentInstance: any) => any = v => v,
  ) {}

  public dispose(removeCache = true) {
    this.isDisposed = true;
    this.subscription && this.subscription.unsubscribe();
    this.subscription = null;
    this.handlerSubscriptions.forEach(s => s.unsubscribe());
    if (removeCache) {
      this.cache = null;
    }
  }

  public prepare(parentState: any = {}) {
    if (!this.intent) {
      this.intent = new Intent();
      this.subject = new SubjectTree();
    }
    this.handlers = getHandlers();

    if (this.stateHandlers) {
      forIn(this.stateHandlers, (v, k) => {
        this.handlers[k] = v;
      });
    }

    if (!this.cache) {
      this.cache = {} as any;

      const intentInstance = {};
      for (const key in this.intentConstructors) {
        intentInstance[key] = this.intentAdvice(
          new this.intentConstructors[key](
            (type: string, payload: any) => {
              this.subject.notify({ type, payload });
              this.intent.push(type, payload);
            },
            {
              intent: this.intent.response,
              ...mapValues(this.handlers, v => v.response),
            },
          ),
        );
      }
      this.cache!.intentInstance = intentInstance;

      const storeGroup = (this.cache!.storeGroup = new StoreGroup(
        intentInstance,
        this.storeConstructors,
        this.service,
        this.subject,
      ));
      this.cache!.storeState = this.stateFactory(
        this.subject.observable,
        storeGroup.initialize(),
      );
      this.cache!.stores = storeGroup.getStores();
    }

    const intentHandler = (type: string, payload?: any) => {
      this.intent.push(type, payload);
      this.subject.notify({ type, payload });
    };

    forIn(this.handlers, handler => {
      handler.setIntent(intentHandler);
      handler.setSubject(this.subject);
    });

    if (this.isDisposed || !this.subscription) {
      const state = { ...this.cache!.storeState };

      this.subscribeHandler(state);

      let firstTime = true;
      let timer: any = 0;
      this.subscription = combineTemplate(state).subscribe(
        state => {
          if (firstTime) {
            firstTime = false;
            state.view = { ...parentState, ...state.view };
            this.notifyUpdate(state);
          } else {
            clearTimeout(timer);
            timer = setTimeout(() => {
              state.view = { ...parentState, ...state.view };
              this.notifyUpdate(state);
            }, BUFFERING_TIME);
          }
        },
        error => {
          console.error(error);
        },
      );
    }

    this.isDisposed = false;
  }

  public emitAsync(emitter: () => void) {
    setTimeout(emitter, BUFFERING_TIME);
  }

  public getPublisher() {
    const ret = (type: string, payload?: any) => {
      this.intent.push(type, payload);
      this.subject.notify({ type, payload });
    };
    ret.subscribe = (
      callback: (payload: { type: string; payload: any }) => void,
    ) => {
      this.intent.subscribeEvent((type, payload) =>
        callback({ type, payload }),
      );
      this.subject.subscribe(callback);
    };
    ret.unsubscribe = () => {
      this.intent.unsubscribeAll();
      this.subject.unsubscribeAll();
    };
    return ret;
  }

  public getState() {
    return this.state;
  }

  public getHandlers() {
    return this.handlers;
  }

  public subscribe(
    subscriber: (state: any, isInitial?: boolean) => void,
    runInitial = false,
  ): () => void {
    this.subscribers.push(subscriber);
    if (runInitial) {
      subscriber(this.state, true);
    }
    return () => {
      let index = -1;
      this.subscribers.some((v, i) => {
        if (v === subscriber) {
          index = i;
          return true;
        }
        return false;
      });
      this.subscribers.splice(index, 1);
    };
  }

  public getStores() {
    return this.cache!.storeGroup.getStores();
  }

  public getIntentInstance() {
    return this.cache!.intentInstance;
  }

  private subscribeHandler(state: { [key: string]: any }) {
    for (const key in this.handlers) {
      this.handlerSubscriptions.push(this.handlers[key].subscribe(state));
    }
  }

  private notifyUpdate(newState: any) {
    this.state = newState;
    this.subject.setState(newState);
    this.intent.setState(newState);
    forIn(this.handlers, v => v.setState(newState));
    this.subscribers.forEach(subscriber => subscriber(newState));
  }

  private notifyUpdateView(viewState: any) {
    this.state.view = viewState;
    this.subject.setState(this.state);
    this.intent.setState(this.state);
    forIn(this.handlers, v => v.setState(this.state));
    this.subscribers.forEach(subscriber => subscriber(this.state));
  }
}
