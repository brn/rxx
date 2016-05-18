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


import * as _     from 'lodash';
import * as React from 'react';
import {
  Observable
}                 from 'rx';
import Injector   from '../di/injector';
import {
  Event,
  Http,
  StorageIO
}                 from '../io/io';
import {
  Service
}                 from '../service';


/**
 * Required props for Context Component.
 */
export type ContextProps = {
  injector  : Injector;
  children? : React.ReactElement<any>;
};


/**
 * Context types.
 */
export type ContextType = {
  injector : Injector;
  event    : Event;
  http     : Http;
  storage  : StorageIO,
  makeService<T>(service: (...a: any[]) => T, ...args: any[]): T
  clean(): void,
  connect<T>(v: T): void
}


/**
 * React contextTypes.
 */
export const ContextReactTypes = {
  injector    : React.PropTypes.instanceOf(Injector),
  event       : React.PropTypes.object,
  http        : React.PropTypes.object,
  storage     : React.PropTypes.object,
  makeService : React.PropTypes.func,
  clean       : React.PropTypes.func,
  connect     : React.PropTypes.func
}


/**
 * Call connect method of the ConnectableObservable for all properties of props.
 */
const connect = (v: any, k?: any) => {
  if (Observable.isObservable(v)) {
    return v.connect && v.connect();
  }
  if (v.isIterable && v.isIterable()) {
    return v;
  }
  _.forIn(v, (v, k) => {
    if (Observable.isObservable(v) && v.connect) {
      v.connect();
    } else if (v.isIterable && v.isIterable()) {
      return v;
    } else if (_.isArray(v)) {
      v.forEach(v, connect);
    } else if (_.isObject(v)) {
      _.forIn(v, connect);
    }
  })
}


/**
 * Context component.
 */
export class Context extends React.Component<ContextProps, {}> {
  static propTypes = {
    injector: React.PropTypes.instanceOf(Injector)
  }; 

  private contextObject: ContextType;


  public constructor(p, c) {
    super(p, c);
    this.contextObject = {
      injector: this.props.injector,
      event: this.props.injector.get('event'),
      http: this.props.injector.get('http'),
      storage: this.props.injector.get('storage'),
      makeService<T>(service: Service<T>, ...args: any[]) {
        const props = service({http: this.http.response, event: this.event.response}, ...args);
        if ('http' in props) {
          _.forIn(props['http'], v => this.http.wait(v));
        }
        
        return props;
      },
      clean() {
        this.event.end();
        this.http.end();
      },
      connect
    };
  }


  public render() {
    return this.props.children;
  }


  public getChildContext() {
    return this.contextObject;
  }


  static get childContextTypes() {
    return ContextReactTypes;
  }
}


export class MVIRootComponent<Props, State> extends React.Component<Props, State> {
  public context: ContextType;


  public static contextTypes = ContextReactTypes;
  

  public componentWillUnmount() {
    this.context.clean();
  }


  protected makeService<T>(service: (...a: any[]) => T) {
    return this.context.makeService(service);
  }


  protected connect<T>(v: T): void {
    this.context.connect(v);
  }
}


export class MVISubtreeComponent<Props, State> extends React.Component<Props, State> {
  public context: ContextType;


  public static contextTypes = ContextReactTypes;
}
