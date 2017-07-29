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
import {
  Subscription,
  Subject,
  Observable
} from 'rxjs/Rx';
import {
  StoreConstructor,
  Store
} from '../store/store';
import {
  Intent,
  IntentClass,
  IntentConstructor
} from '../intent/intent';
import {
  HandlerResponse,
  getHandlers
} from '../handler/handler';
import {
  forIn,
  isArray,
  mapValues,
  omit
} from '../utils';
import {
  combineTemplate
} from '../observable/combine-template';
import {
  Provisioning,
  IntentHandler
} from '../provisioning';


/**
 * Provider context type.
 */
export interface ProviderContextType<State> {
  store: Store<State>;
  intent: IntentHandler;
  state: any;
  parent: ProviderContextType<any>;
}


/**
 * Provider props.
 */
export type ProviderProps = {
  intent: IntentConstructor;
  store: StoreConstructor<any, any> | StoreConstructor<any, any>[];
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
export class Provider extends React.Component<ProviderProps, {}> {
  public static contextTypes = { intent: PropTypes.any, state: PropTypes.any, parent: PropTypes.any, __intent: PropTypes.any };

  /**
   * Internal component.
   */
  private ProviderComponent: React.ComponentClass<any>;

  private provisioning: Provisioning<ProviderContextType<any> & { state: any; __intent: Intent }>;

  private storeState: { view: any };

  private childrenProps: { [key: string]: any };

  public context: ProviderContextType<any> & { __intent: Intent };


  constructor(p, c) {
    super(p, c);
    this.provisioning = new Provisioning(this.context, this.props.intent, this.props.store, this.props.service);
    const { provisioning, context } = this;

    this.ProviderComponent = class ProviderComponent extends React.Component<any, any> {
      public render() {
        return this.props.children;
      }

      public getChildContext() {
        return {
          intent: provisioning.getIntentHandler(),
          state: provisioning.getState(),
          parent: context,
          __intent: provisioning.getIntent()
        };
      }


      static get childContextTypes() {
        return Provider.contextTypes;
      }
    };
  }

  public render() {
    return (
      <this.ProviderComponent>
        {
          React.cloneElement(this.props.children as any, this.childrenProps)
        }
      </this.ProviderComponent>
    );
  }


  public componentWillUnmount() {
    this.provisioning.dispose(!this.props.useCache);
  }


  public componentWillMount() {
    this.provisioning.prepare();
    this.childrenProps = {
      ...omit(this.props, ['store', 'intent', 'service', 'children']),
      ...this.provisioning.getState().view || {}
    };
  }


  public componentWillReceiveProps(nextProps) {
    this.childrenProps = {
      ...omit(nextProps, ['store', 'intent', 'service', 'children']),
      ...this.provisioning.getState().view || {}
    };
  }
}
