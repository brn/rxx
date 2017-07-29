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


export type ConnectArgs = { mapStateToProps?: Function; mapIntentToProps?: Function };
const identity = a => a;
const DEFAULT = { mapStateToProps: undefined, mapIntentToProps: undefined };

export const CONTEXT_TYPES = {
  intent: PropTypes.any,
  state: PropTypes.any,
  parent: PropTypes.any
};


/**
 * Connect store and intent to store.
 * @param args mapStateToProps convert store state to Component props.  
 * mapIntentToProps convert intent to props.
 * @returns Function that wrap passed component with Context component.
 */
export function connect<T>(args: ConnectArgs = DEFAULT) {
  const {
    mapStateToProps = s => s,
    mapIntentToProps = i => ({})
  } = args;

  return <T extends React.ComponentClass<any>>(C: T) => {

    // Set context type to passed to component.
    C.contextTypes = CONTEXT_TYPES;

    const displayName =
      `${C.name || C.displayName || 'AnonymousComponent'}$EnhancedReactMVIContextConnectorComponent`;

    /**
     * Component wrapper that pass context to children component
     */
    return class extends React.Component<any, {}> {
      public static displayName = displayName;

      public mappedProps;

      constructor(p, c) {
        super(p, c);
        this.mappedProps = {
          ...mapStateToProps(this.props),
          ...mapIntentToProps(this.context.intent)
        };
      }

      public render() {
        return <C {...this.mappedProps} />;
      }

      public componentWillReceiveProps(nextProps) {
        this.mappedProps = {
          ...mapStateToProps(nextProps),
          ...mapIntentToProps(this.context.intent)
        };
      }

      public getChildContext() {
        return {
          intent: this.context.intent,
          state: this.context.state,
          parent: this.context.parent
        };
      }

      static get childContextTypes() {
        return CONTEXT_TYPES;
      }

      public static contextTypes = CONTEXT_TYPES;
    };
  };
}

