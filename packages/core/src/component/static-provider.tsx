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
import { Intent } from '../intent/intent';
import { combineTemplate } from '../observable/combine-template';
import { Provider } from './provider';
import { Provisioning } from '../provisioning';
import { IntentHandler } from '../intent/intent-handler';

/**
 * Provider props.
 */
export type StaticContextProps = {
  provisioning: {
    __intent: Intent;
  };
};

export function initStaticProvider() {
  return {
    __intent: new Intent(),
    getIntent(): Intent {
      return this.__intent;
    },
  };
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
export class StaticContext extends React.Component<StaticContextProps, {}> {
  public static contextTypes = {
    intent: PropTypes.any,
    state: PropTypes.any,
    parent: PropTypes.any,
    unobservablifiedStateGetter: PropTypes.any,
    __intent: PropTypes.any,
  };

  private ProviderComponent: React.ComponentClass<any>;

  constructor(p, c) {
    super(p, c);
    const { __intent } = this.props.provisioning;

    this.ProviderComponent = class ProviderComponent extends React.Component<
      any,
      any
    > {
      public render() {
        return this.props.children as React.ReactElement<any>;
      }

      public getChildContext() {
        return {
          intent: null,
          state: {},
          unobservablifiedStateGetter: {},
          parent: {},
          __intent,
        };
      }

      static get childContextTypes() {
        return Provider.contextTypes;
      }
    };
  }

  public render() {
    return (
      <this.ProviderComponent>{this.props.children}</this.ProviderComponent>
    );
  }
}
