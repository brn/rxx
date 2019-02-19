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
import { forIn, isArray, mapValues } from './utils';
import { combineTemplate } from './observable/combine-template';
import { generateIntentHandler, IntentHandler } from './intent/intent-handler';
import { SubjectTree } from './subject';
import { ReduxDevTools, connectDevTools } from './devtools';
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
          state.view = { ...state.view, ...nextState.view };
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

export class Provisioning<
  ContextType extends {
    provisioning?: Provisioning<any>;
    __intent?: Intent;
    __subject?: SubjectTree;
  }
> {
  private subscription!: Subscription | null;

  private intent!: Intent;

  private subject!: SubjectTree;

  private isDisposed = false;

  private handlerSubscriptions: Subscription[] = [];

  private unobservablifiedState: any;

  private subscribers: ((state: any) => void)[] = [];

  private state: any;

  private handlers: { [key: string]: Handler } = {};

  private devTools: ReduxDevTools;

  private devToolsSubscribers: (() => void)[] = [];

  private cache: {
    storeGroup: StoreGroup;
    stores: Store<any>[];
    intentInstance: any;
    intentHandler: IntentHandler;
    /**
     * Initial state created by store.
     */
    storeState: StoreGroupState;
  } | null = null;

  constructor(
    private name: string,
    private context: ContextType,
    private intentConstructors: { [key: string]: IntentConstructor },
    private storeConstructors: StoreConstructor<any, any>[],
    private stateFactory: StateFactory = (o, i) => i,
    private service: { [key: string]: any } = {},
    private stateHandlers: { [key: string]: StateHandler } = {},
    private intentAdvice: (intentInstance: any) => any = v => v,
  ) {
    if (!this.context.provisioning) {
      this.handlers = getHandlers();
    } else {
      forIn(getHandlers(), (v, k) => {
        this.handlers[k] = v.clone();
      });
    }

    if (this.stateHandlers) {
      forIn(this.stateHandlers, (v, k) => {
        this.handlers[k] = v;
      });
    }

    this.devTools = connectDevTools({ name: this.name, instanceId: this.name });
  }

  public dispose(removeCache = true) {
    this.isDisposed = true;
    this.subscription && this.subscription.unsubscribe();
    this.subscription = null;
    this.intent.dispose();
    this.handlerSubscriptions.forEach(s => s.unsubscribe());
    this.devToolsSubscribers.forEach(a => a());
    if (removeCache) {
      this.cache = null;
    }
  }

  public prepare() {
    if (this.isDisposed) {
      this.intent.prepare(this.context.__intent);
      this.subject.prepare(this.context.__subject);
    } else if (!this.intent) {
      this.intent = new Intent(this.context.__intent);
      this.subject = new SubjectTree(this.devTools, this.context.__subject);
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
      const intentHandler = (this.cache!.intentHandler = generateIntentHandler(
        this.intent,
        this.subject,
      ));
      this.cache!.storeState = this.stateFactory(
        this.subject.observable,
        storeGroup.initialize(),
      );
      this.cache!.stores = storeGroup.getStores();
    }

    forIn(this.handlers, handler => {
      handler.setIntent(this.cache!.intentHandler);
      handler.setSubject(this.subject);
    });

    if (this.isDisposed || !this.subscription) {
      const state = { ...this.cache!.storeState };

      this.subscribeHandler(state);

      this.subscription = combineTemplate(state).subscribe(
        state => {
          if (this.context && this.context.provisioning) {
            const parentState = this.context.provisioning.getState();
            for (const key in parentState) {
              if (state[key]) {
                state[key] = { ...parentState[key], ...state[key] };
              } else {
                state[key] = parentState[key];
              }
            }
          }

          this.notifyUpdate(state);
        },
        error => {
          console.error(error);
        },
      );

      this.devToolsSubscribers.push(
        this.devTools.subscribe(message => {
          if (
            message.type === 'DISPATCH' &&
            message.payload.type === 'JUMP_TO_STATE'
          ) {
            const state = JSON.parse(message.state);
            this.notifyUpdateView(state);
            this.subject.suspendDevtools();
            this.subject.notify({
              type: SystemEvent.REPLACE_STATE,
              payload: { state: state },
            });
            this.subject.notify(state.__payload__);
            this.subject.resumeDevtools();
          }
        }),
      );
    }

    this.isDisposed = false;
  }

  public getStores() {
    return this.cache!.storeGroup.getStores();
  }

  public getState() {
    return this.state;
  }

  public getIntentHandler() {
    return this.cache!.intentHandler;
  }

  public getIntentInstance() {
    return this.cache!.intentInstance;
  }

  public getIntent() {
    return this.intent;
  }

  public getSubject() {
    return this.subject;
  }

  public subscribe(
    subscriber: (state: any) => void,
    runInitial = false,
  ): () => void {
    this.subscribers.push(subscriber);
    if (runInitial) {
      subscriber(this.state);
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

  public getHandlers() {
    return this.handlers;
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
