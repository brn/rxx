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
 * WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  forIn,
  isArray,
  mapValues,
  omit,
  isObject,
  mergeDeep,
  IDGenerator,
  isDefined,
} from '../utils';
import { Component } from 'react';

/**
 * Provider context type.
 */
export interface ProviderContextType {
  state: any;
  intent: IntentHandler;
  parent: Provider | null;
}

/**
 * Provider props.
 */
export type ProviderProps = {
  initWorker: () => Worker;
  useCache?: boolean;
  [key: string]: any;
};

export interface IntentHandler {
  (type: string, payload: any): any;
  callback(type: string, payload?: any, fix?: boolean): (payload?: any) => any;
}

function createIntentHandler(worker: Worker): IntentHandler {
  function intent(type: string, payload: any) {
    return worker.postMessage({ type: 'DISPATCH', payload: { type, payload } });
  }
  intent.callback = (type: string, ppayload?: any, fix?: boolean) => (
    payload?: any,
  ) => intent(type, isDefined(ppayload) && !fix ? ppayload : payload);

  return intent;
}

export const Context: React.Context<ProviderContextType> = React.createContext({
  parent: null as any,
  state: {},
  intent: null as any,
});

interface ProviderSubscriptions {
  onDispatch(type: string, payload: any): void;
  onInitialize(payload: any): void;
}

/**
 * Container component for intent and state.
 * This component provide context object and props from store state.
 *
 * @example
 * <Provider store={Store} intent={Intent}>
 *   <Component />
 * </Provider>
 */
export class Provider extends React.Component<
  ProviderProps,
  { prepared: boolean; state: any }
> {
  public static contextTypes = Context;

  private ConsumerComponent: React.ComponentClass<any>;

  private worker: Worker;

  private subscribers: ProviderSubscriptions[] = [];

  public state!: any;

  constructor(p) {
    super(p);
    const { props } = this;
    const that = this;
    const worker = (this.worker = that.props.initWorker());

    this.ConsumerComponent = class ComsumerComopnent extends React.Component<
      ProviderContextType,
      { prepared: boolean; state: {} }
    > {
      private storeState!: { view: any };

      private intentHandler!: IntentHandler;

      private dispose!: () => void;

      public state = { prepared: false, state: {} };

      public constructor(p) {
        super(p);
        worker.addEventListener('message', e => {
          const { type, payload } = e.data;
          if (type === 'INITIALIZED') {
            this.setState({
              prepared: true,
              state: payload,
            });
            that.state = payload;
            that.subscribers.forEach(({ onInitialize }) =>
              onInitialize(payload),
            );
          } else if (type === 'DISPATCH') {
            that.subscribers.forEach(({ onDispatch }) =>
              onDispatch(type, payload),
            );
          } else if (type === 'UPDATE') {
            that.state = payload;
            this.setState({
              state: payload,
            });
          }
        });

        if (this.props.parent) {
          this.dispose = this.props.parent.subscribe({
            onDispatch: (type, payload) => this.post(type, payload),
            onInitialize: payload => this.post('INITIALIZE', payload),
          });
        } else {
          this.post('INITIALIZE', {});
        }
      }

      public render() {
        return this.state.prepared ? (
          <Context.Provider
            value={{
              parent: that,
              intent: createIntentHandler(worker),
              state: this.state.state,
            }}
          >
            {this.props.children}
          </Context.Provider>
        ) : null;
      }

      public componentWillUnmount() {
        this.setState({ prepared: false });
        this.dispose && this.dispose();
      }

      private post(type: string, payload: any) {
        worker.postMessage({ type, payload });
      }
    };
  }

  public componentWillUnmount() {
    try {
      this.worker.postMessage({ type: 'EXIT', payload: {} });
      this.worker.terminate();
    } catch (e) {}
  }

  public render() {
    return (
      <Context.Consumer>
        {context => {
          return (
            <this.ConsumerComponent {...context}>
              {React.cloneElement(this.props.children as any)}
            </this.ConsumerComponent>
          );
        }}
      </Context.Consumer>
    );
  }

  public subscribe(subscription: ProviderSubscriptions) {
    this.subscribers.push(subscription);
    if (this.state) {
      subscription.onInitialize(this.state);
    }
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== subscription);
    };
  }
}
