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

import * as React from "react";
import * as PropTypes from "prop-types";
import { mergeDeep } from "../utils";
import { combineTemplate } from "../observable/combine-template";
import { Subscription } from "rxjs";
import { Provisioning } from "../provisioning";
import { IntentHandler } from "../intent/intent-handler";
import { ProviderContextType } from "../component/provider";

export type ConnectArgs<State, Props, I, S> = {
  mapStateToProps?(
    state: State,
    props: Props,
    component: React.Component<{ props: Props; state: State }>
  ): S;
  mapIntentToProps?(
    intent: IntentHandler,
    state: State,
    props: Props,
    component: React.Component<{ props: Props; state: State }>
  ): I;
};
const identity = a => a;
const DEFAULT = {
  mapStateToProps: undefined,
  mapIntentToProps: undefined
};

export const CONTEXT_TYPES = {
  intent: PropTypes.any,
  state: PropTypes.any,
  unobservablifiedStateGetter: PropTypes.any,
  parent: PropTypes.any
};

/**
 * Connect store and intent to store.
 * @param args mapStateToProps convert store state to Component props.
 * mapIntentToProps convert intent to props.
 * @returns Function that wrap passed component with Context component.
 */
export function connect<Props = any, State = any, I = any, S = any>(
  args: ConnectArgs<State, Props, I, S> = DEFAULT
): (C: React.ComponentClass<I & S>) => React.ComponentClass<Props> {
  const {
    mapStateToProps = (a, b, c) => ({ ...a, ...b }),
    mapIntentToProps = (a, b, c, d) => ({})
  } = args;

  return <T extends React.ComponentClass<I & S>>(
    C: T
  ): React.ComponentClass<Props> => {
    // Set context type to passed to component.
    C.contextTypes = CONTEXT_TYPES;

    const displayName = `${C.name ||
      C.displayName ||
      "AnonymousComponent"}$EnhancedReactMVIContextConnectorComponent`;

    type ContainerComponentProps = { props: Props; state: State };
    /**
     * Component wrapper that pass context to children component
     */
    const ContainerComponent = class extends React.Component<
      ContainerComponentProps,
      {}
    > {
      public static displayName = displayName;

      public mappedProps: I & S;

      public context: ProviderContextType<any>;

      constructor(p, c) {
        super(p, c);
        this.mappedProps = mergeDeep(
          this.mapStateToProps(this.props),
          this.mapIntentToProps(this.props)
        );
      }

      public render() {
        return <C {...this.mappedProps} />;
      }

      public componentWillReceiveProps(nextProps) {
        this.mappedProps = mergeDeep(
          this.mapStateToProps(nextProps),
          this.mapIntentToProps(nextProps)
        );
      }

      public getChildContext() {
        return {
          intent: this.context.intent,
          state: this.context.state,
          parent: this.context.parent
        };
      }

      private mapIntentToProps(props: ContainerComponentProps) {
        return mapIntentToProps(
          this.context.intent,
          props.state,
          props.props,
          this
        );
      }

      private mapStateToProps(props: ContainerComponentProps) {
        return mapStateToProps(props.state, props.props, this);
      }

      static get childContextTypes() {
        return CONTEXT_TYPES;
      }

      public static contextTypes = CONTEXT_TYPES;
    };

    return class extends React.Component<Props, { state: State }> {
      public context!: { provisioning: Provisioning<any> };

      private unsubscribe: () => void;

      constructor(p) {
        super(p);
        this.state = {
          state: null
        };
      }

      public render() {
        return (
          <ContainerComponent state={this.state.state} props={this.props} />
        );
      }

      public componentWillMount() {
        this.unsubscribe = this.context.provisioning.subscribe(state => {
          this.setState({ state: state.view });
        }, true);
      }

      public componentWillUnmount() {
        this.unsubscribe();
      }

      public static contextTypes = { provisioning: PropTypes.any };
    };
  };
}
