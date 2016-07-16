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


import * as React from 'react';
import {
  ContextReactTypes,
  ContextType,
  setContext
} from './context';
import {
  _
} from './../shims/lodash';


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
export function component<Props, C>(component: (StatelessComponentConfig<Props>|Render<Props>|React.ComponentClass<Props>), componentName?: string, additionalContext: C = ({} as any)): new(props: Props, context: ContextType & C) => React.Component<Props, {}> {
  /**
   * Check whether render is React.Component or not.
   */
  function isComponent(maybeComponent: any): maybeComponent is React.ComponentClass<Props> {
    return typeof maybeComponent === 'function' && typeof maybeComponent.prototype.render === 'function';
  }


  /**
   * Check whether render is function or not.
   */
  function isRender(v: any): v is Render<Props> {
    return typeof v === 'function';
  }

  let ret: React.ComponentClass<Props>;


  if (isComponent(component)) {
    const Renderer: React.ComponentClass<Props> = component as React.ComponentClass<Props>;
    ret = class extends Renderer {
      static contextTypes = _.assign(ContextReactTypes, additionalContext) as any;
    }
    if (Renderer['name']) {
      ret['displayName'] = Renderer['name'];
    }
  } else {
    const renderer = component as StatelessComponentConfig<Props>|Render<Props>;
    /**
     * React.Component that is created from passed function or object.
     */
    ret = class extends React.Component<Props, {}> {
      public render() {
        return isRender(renderer)? renderer.call(this, this.props, this.context): renderer.render.call(this, this.props, this.context);
      }

      public componentWillMount() {
        if (!isRender(renderer) && renderer.componentWillMount) {
          renderer.componentWillMount.call(this);
        }
      }

      public componentDidMount() {
        if (!isRender(renderer) && renderer.componentDidMount) {
          renderer.componentDidMount.call(this);
        }
      }

      public componentDidUpdate() {
        if (!isRender(renderer) && renderer.componentDidUpdate) {
          renderer.componentDidUpdate.call(this);
        }
      }

      public componentWillUnmount() {
        if (!isRender(renderer) && renderer.componentWillUnmount) {
          renderer.componentWillUnmount.call(this);
        }
      }

      public shouldComponentUpdate(nextProps) {
        if (!isRender(renderer) && renderer.shouldComponentUpdate) {
          return renderer.shouldComponentUpdate.call(this, nextProps);
        }
        return true;
      }

      static contextTypes = _.assign(ContextReactTypes, additionalContext)
    } as any;
  }


  if (componentName) {
    ret['displayName'] = componentName;
  }
  return ret as any;
}
