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
  Subscription,
  Subject,
  Observable
} from 'rxjs/Rx';
import {
  StoreConstructor,
  Store
} from './store/store';
import {
  Intent,
  IntentClass,
  IntentConstructor
} from './intent/intent';
import {
  HandlerResponse,
  getHandlers
} from './handler/handler';
import {
  forIn,
  isArray,
  mapValues
} from './utils';
import {
  combineTemplate
} from './observable/combine-template';


/**
 * Intent dispatcher interface.
 */
export interface IntentHandler {
  (key: string, args?: any): void;
  callback(key: string, args?: any): (e?: any) => void;
}

/**
 * Create intent handler from Intent StateHandler.
 * @param intent Intent StateHandler instance.
 * @returns IntentHandler implementation.
 */
function generateIntentHandler(intent: Intent): IntentHandler {
  const intentCallable: any = (key: string, args: any) => {
    intent.push(key, args);
  };
  intentCallable.callback = (k, v) => intent.callback(k, v);

  return intentCallable;
}


/**
 * Type definition of state which created by StoreGroup.
 */
export interface StoreGroupState {
  view: { [key: string]: any };
  [key: string]: any;
}


/**
 * Group of stores.  
 * That merge multiple store state to one monolithic state.
 */
class StoreGroup implements Store<StoreGroupState> {
  private storeInstances: Store<any>[] = [];

  constructor(
    private intent: IntentClass,
    private stores: StoreConstructor<any, any>[],
    private service: { [key: string]: any }) { }

  /**
   * @returns Merged state.
   */
  public initialize() {
    // Reduce to create one monolithic state.
    return this.stores.reduce((state, Store) => {
      const store = new Store(this.intent, this.service);
      const nextState = store.initialize();
      this.storeInstances.push(store);
      for (const key in nextState) {
        if (state[key]) {
          state[key] = { ...state[key], ...nextState[key] };
        } else {
          state[key] = nextState[key];
        }
      }

      return state;
    }, { view: {} });
  }


  public getStores() {
    return this.storeInstances;
  }
}


export class Provisioning<ContextType extends { state: any; __intent: Intent }> {
  private subscription: Subscription;

  private storeConstructors: StoreConstructor<any, any>[];

  private IntentClass: IntentConstructor;

  private intent: Intent;

  private isDisposed = false;

  private handlerSubscriptions: Subscription[] = [];

  private unobservablifiedState: any;

  private cache: {
    storeGroup: StoreGroup;
    stores: Store<any>[];
    intentInstance: any;
    intentHandler: IntentHandler;
    /**
     * Initial state created by store.
     */
    storeState: StoreGroupState;
  } = null;


  constructor(
    private context: ContextType,
    IntentClass: IntentConstructor,
    Store: StoreConstructor<any, any> | StoreConstructor<any, any>[],
    private service: { [key: string]: any },
    private intentAdvice: (intentInstance: any) => any = v => v) {
    this.IntentClass = IntentClass;
    const stores: StoreConstructor<any, any>[] = this.storeConstructors = isArray(Store) ? Store : [Store];
  }


  public dispose(removeCache = true) {
    this.isDisposed = true;
    this.subscription.unsubscribe();
    this.subscription = null;
    this.intent.dispose();
    this.handlerSubscriptions.forEach(s => s.unsubscribe());
    if (removeCache) {
      this.cache = null;
    }
  }


  public prepare() {
    if (this.isDisposed) {
      this.intent.prepare(this.context.__intent);
    } else if (!this.intent) {
      this.intent = new Intent(this.context.__intent);
    }

    if (!this.cache) {
      this.cache = {} as any;

      const intentInstance = this.cache.intentInstance = this.intentAdvice(new this.IntentClass({
        intent: this.intent.response,
        ...mapValues(getHandlers(), v => v.response)
      })) as any;

      const storeGroup = this.cache.storeGroup = new StoreGroup(intentInstance, this.storeConstructors, this.service);
      const intentHandler = this.cache.intentHandler = generateIntentHandler(this.intent);
      this.cache.storeState = storeGroup.initialize();
      this.cache.stores = storeGroup.getStores();
    }

    if (this.isDisposed || !this.subscription) {
      const state = { ...this.cache.storeState };

      this.subscribeHandler(this.cache.storeState);

      if (this.context) {
        for (const key in this.context.state) {
          if (state[key]) {
            state[key] = { ...state[key], ...this.context.state[key] };
          }
        }
      }

      this.subscription = combineTemplate(state).subscribe(state => {
        this.unobservablifiedState = state;
        this.intent.setState(state);
        forIn(getHandlers(), v => v.setState(state));
      });
    }

    this.isDisposed = false;
  }


  public getStores() {
    return this.cache.storeGroup.getStores();
  }


  public getState() {
    return this.cache.storeState;
  }


  public getUnobservablifiedStateGetter() {
    return () => this.unobservablifiedState;
  }


  public getIntentHandler() {
    return this.cache.intentHandler;
  }


  public getIntentInstance() {
    return this.cache.intentInstance;
  }


  public getIntent() {
    return this.intent;
  }


  private subscribeHandler(state: { [key: string]: any }) {
    const handlers = getHandlers();
    for (const key in handlers) {
      this.handlerSubscriptions.push(handlers[key].subscribe(state));
    }
  }
}
