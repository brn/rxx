// -*- mode: typescript -*-
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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview 
 * @author Taketoshi Aono
 */


import {
  ContextReactTypes,
  ContextType,
  setContext
} from './context';
import * as React from 'react';


/**
 * Render function type.
 */
export type Render<Props> = (props: Props, context?: any) => React.ReactElement<any>;


/**
 * component function args type.
 */
export type StatelessComponentConfig<Props> = {
  render: Render<Props>,
  componentWillMount?(): void,
  componentDidMount?(): void,
  componentWillUnmount?(): void,
  componentDidUpdate?(): void
  shouldComponentUpdate?(props: Props): boolean
}


/**
 * Create stateless CompositeComponent with context that type is `ContextReactType`.
 * @param render Render function or object that implements each lifecycle methods.
 */
export function component<Props>(render: (StatelessComponentConfig<Props>|Render<Props>), componentName?: string): new(props: Props, context: ContextType) => React.Component<Props, {}> {
  /**
   * Check whether render is function or not.
   */
  function isRender(v: any): v is Render<Props> {
    return typeof v === 'function';
  }

  /**
   * React.Component that is created from passed function or object.
   */
  const ret = class extends React.Component<Props, {}> {
    public render() {
      return isRender(render)? render.call(this, this.props, this.context): render.render.call(this, this.props, this.context);
    }

    public componentWillMount() {
      if (!isRender(render) && render.componentWillMount) {
        render.componentWillMount.call(this);
      }
    }

    public componentDidMount() {
      if (!isRender(render) && render.componentDidMount) {
        render.componentDidMount.call(this);
      }
    }

    public componentDidUpdate() {
      if (!isRender(render) && render.componentDidUpdate) {
        render.componentDidUpdate.call(this);
      }
    }

    public componentWillUnmount() {
      if (!isRender(render) && render.componentWillUnmount) {
        render.componentWillUnmount.call(this);
      }
    }

    public shouldComponentUpdate(nextProps) {
      if (!isRender(render) && render.shouldComponentUpdate) {
        return render.shouldComponentUpdate.call(this, nextProps);
      }
      return true;
    }

    static contextTypes = ContextReactTypes
  } as any;


  if (componentName) {
    ret['displayName'] = componentName;
  }
  return ret;
}
