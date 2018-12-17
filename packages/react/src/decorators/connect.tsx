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

import * as React from 'react';
import * as PropTypes from 'prop-types';
import { mergeDeep } from '../utils';
import {
  ProviderContextType,
  IntentHandler,
  Context,
} from '../component/provider';

export type ConnectArgs<State, Props, I, S> = {
  mapStateToProps?(
    state: State,
    props: Props,
    component: React.Component<{ props: Props; state: State }>,
  ): S;
  mapIntentToProps?(
    intent: IntentHandler,
    state: State,
    props: Props,
    component: React.Component<{ props: Props; state: State }>,
  ): I;
};
const identity = a => a;
const DEFAULT = {
  mapStateToProps: undefined,
  mapIntentToProps: undefined,
};

/**
 * Connect store and intent to store.
 * @param args mapStateToProps convert store state to Component props.
 * mapIntentToProps convert intent to props.
 * @returns Function that wrap passed component with Context component.
 */
export function connect<Props = any, State = any, I = any, S = any>(
  args: ConnectArgs<State, Props, I, S> = DEFAULT,
): (C: React.ComponentClass<I & S>) => React.ComponentClass<Props> {
  const {
    mapStateToProps = ((a, b, c) => ({ ...a, ...b })) as any,
    mapIntentToProps = (() => ({})) as any,
  } = args;

  return <T extends React.ComponentClass<I & S>>(
    C: T,
  ): React.ComponentClass<Props> => {
    // Set context type to passed to component.
    C.contextType = Context;

    const baseName = `${C.displayName || C.name || 'AnonymousComponent'}`;
    const rootDisplayName = `${baseName}$EnhancedContextConnectorComponent`;
    const internalContainerName = `${baseName}$EnhancedRenderingContainer`;

    type InnerContainerComponentProps = {
      context: ProviderContextType;
    } & { props: Props };
    /**
     * Component wrapper that pass context to children component
     */
    return class ContainerComponent extends React.Component<Props, {}> {
      public static displayName = internalContainerName;

      private InnerContainerComponent = class InnerContainerComponent extends React.Component<
        InnerContainerComponentProps
      > {
        public static displayName = 'InnerContainerComponent';

        public mappedProps: I & S;

        constructor(p) {
          super(p);
          this.mappedProps = mergeDeep(
            this.mapStateToProps(this.props),
            this.mapIntentToProps(this.props),
          );
        }

        public render() {
          return this.props.props['children'] ? (
            <C {...this.mappedProps as any}>{this.props.props['children']}</C>
          ) : (
            <C {...this.mappedProps as any} />
          );
        }

        public componentWillReceiveProps(nextProps) {
          this.mappedProps = mergeDeep(
            this.mapStateToProps(nextProps),
            this.mapIntentToProps(nextProps),
          );
        }

        private mapIntentToProps(props: InnerContainerComponentProps) {
          return mapIntentToProps(
            props.context.intent as any,
            props.context.state,
            props.props,
            this as any,
          );
        }

        private mapStateToProps(props: InnerContainerComponentProps) {
          return mapStateToProps(props.context.state, props.props, this);
        }
      };

      public render() {
        return (
          <Context.Consumer>
            {context => (
              <this.InnerContainerComponent
                props={this.props}
                context={context}
              />
            )}
          </Context.Consumer>
        );
      }

      public static contextType = Context;
    };
  };
}
