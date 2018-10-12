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

import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Subscription, Subject, Observable, of } from 'rxjs';
import { StoreConstructor, Store, StateFactory } from '../store/store';
import { Intent, IntentClass, IntentConstructor } from '../intent/intent';
import { HandlerResponse } from '../handler/handler';
import { getHandlers, StateHandler } from '../handler/state-handler';
import {
  forIn,
  isArray,
  mapValues,
  omit,
  isObject,
  mergeDeep,
  IDGenerator,
} from '../utils';
import { combineTemplate } from '../observable/combine-template';
import { Provisioning } from '../provisioning';
import { IntentHandler } from '../intent/intent-handler';
import { Component } from 'react';
import { SubjectTree } from '../subject';
import { flatScan } from '../observable/flatscan';
import { startWith, map, tap } from 'rxjs/operators';

/**
 * Provider context type.
 */
export interface ProviderContextType<State> {
  intent: IntentHandler;
  state: any;
  parent: ProviderContextType<any>;
}

/**
 * Provider props.
 */
export type ProviderProps = {
  intent?: IntentConstructor | { [key: string]: IntentConstructor };
  store?: StoreConstructor<any, any> | StoreConstructor<any, any>[];
  app?: StateFactory;
  service?: { [key: string]: any };
  useCache?: boolean;
  [key: string]: any;
};

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
  { prepared: boolean }
> {
  public static contextTypes = {
    provisioning: PropTypes.any,
    intent: PropTypes.any,
    state: PropTypes.any,
    parent: PropTypes.any,
    __subject: PropTypes.any,
    __intent: PropTypes.any,
  };

  /**
   * Internal component.
   */
  private ProviderComponent: React.ComponentClass<any>;

  private provisioning: Provisioning<
    ProviderContextType<any> & {
      provisioning: Provisioning<any>;
      __subject: SubjectTree;
      __intent: Intent;
    }
  >;

  private storeState: { view: any };

  public context: ProviderContextType<any> & {
    provisioning: Provisioning<any>;
    __subject: SubjectTree;
    __intent: Intent;
  };

  constructor(p, c) {
    super(p, c);
    this.provisioning = new Provisioning(
      this.props.name || `Anonymouse#${IDGenerator.genNextId()}`,
      this.context,
      this.props.intent
        ? isObject<{ [key: string]: IntentConstructor }>(this.props.intent)
          ? this.props.intent
          : { intent: this.props.intent }
        : {},
      this.props.store
        ? Array.isArray(this.props.store)
          ? this.props.store
          : [this.props.store]
        : [],
      this.props.app,
      this.props.service,
      this.props.stateHandlers || {},
    );

    const { provisioning, context, props } = this;

    this.ProviderComponent = class ProviderComponent extends React.Component<
      any,
      any
    > {
      public render() {
        return this.props.children as React.ReactElement<any>;
      }

      public getChildContext() {
        return {
          provisioning,
          intent: provisioning.getIntentHandler(),
          state: provisioning.getState(),
          parent: context,
          __intent: provisioning.getIntent(),
          __subject: provisioning.getSubject(),
        };
      }

      static get childContextTypes() {
        return Provider.contextTypes;
      }
    };
    this.state = { prepared: false };
  }

  public render() {
    return this.state.prepared ? (
      <this.ProviderComponent>
        {React.cloneElement(this.props.children as any)}
      </this.ProviderComponent>
    ) : null;
  }

  public componentDidMount() {
    this.provisioning.prepare();
    this.setState({ prepared: true });
  }

  public componentWillUnmount() {
    this.provisioning.dispose(!this.props.useCache);
    this.setState({ prepared: false });
  }
}

export function directConnect<State, Props>(
  Component: React.ComponentClass<Props>,
): React.ComponentClass<{
  state?: State;
  props?: Props;
  handlers?: { [key: string]: (...args: any[]) => any }[];
  stateHandlers?: { [key: string]: StateHandler };
  app?: StateFactory;
}> {
  type InnerComponentProps = {
    state?: State;
    props?: Props;
    handlers?: { [key: string]: (...args: any[]) => any }[];
    stateHandlers?: { [key: string]: StateHandler };
    app?: StateFactory;
  };

  return class extends React.Component<InnerComponentProps> {
    private store: StoreConstructor<any, { view: any }>;
    private intent: { [key: string]: IntentConstructor };
    private subject: Subject<State> = new Subject();
    private subscriptions = new Subscription();
    private reference: React.Component<Props>;

    public render() {
      return (
        <Provider
          store={[this.store]}
          intent={class {}}
          app={this.props.app ? this.props.app : undefined}
          stateHandlers={this.props.stateHandlers}
        >
          <Component
            {...this.props.props}
            ref={c => c && (this.reference = c)}
          />
        </Provider>
      );
    }

    public componentWillMount() {
      /*tslint:disable:no-this-assignment*/
      const that = this;
      /*tslint:enable:no-this-assignment*/
      const { props, subject, subscriptions } = this;
      this.store = class {
        constructor(private intent, private services, private subject) {}
        public initialize() {
          const convertedStates: { [key: string]: Observable<any> } = {};
          for (const key in props.state) {
            const v = props.state[key];
            convertedStates[key] = that.subject.pipe(
              map(v => v[key]),
              startWith(v),
            );
          }
          const handlersArray = that.props.handlers || [];
          that.subscriptions.add(
            this.subject.subscribe(args => {
              handlersArray.forEach(handlers => {
                if (handlers[args.type]) {
                  handlers[args.type](args);
                }
              });
            }),
          );
          return {
            view: convertedStates,
          };
        }
      };
    }

    public get component() {
      return this.reference;
    }

    public componentWillReceiveProps(nextProps: InnerComponentProps) {
      this.subject.next(nextProps.state);
    }

    public componentWillUnmount() {
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();
    }
  };
}
