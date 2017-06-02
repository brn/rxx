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
import * as PropTypes from 'prop-types';
import {
  ConnectableObservable,
  Observable,
  Subscription
}                 from 'rxjs/Rx';
import {
  Module
}                 from '../di/module';
import {
  Injector
}                 from '../di/injector';
import {
  IO,
  BasicIOTypes,
  IO_MARK
}                 from '../io/io';
import {
  SERVICE_MARK,
  Service
}                 from '../service/service';
import {
  isDefined,
  assign,
  forIn,
  isArray,
  isObject,
  mapValues,
  map
}                 from '../utils';


export interface IOTypes extends BasicIOTypes {
  [key: string]: IO;
}


/**
 * Context types.
 */
export interface ContextType {
  createProps<T>(...args: any[])
  clean(): void,
  connect<T>(v: T): void,
  injector: Injector;
  io: IOTypes
}


/**
 * React contextTypes.
 */
export const ContextReactTypes = {
  createProps : PropTypes.func,
  clean       : PropTypes.func,
  connect     : PropTypes.func,
  injector    : PropTypes.object,
  io          : PropTypes.object
}


const isEnumerable = (v: any) => {
  if (!v || typeof v !== 'object') {
    return false;
  }

  if (Object.getPrototypeOf) {
    if (Object.getPrototypeOf(v) !== Object.prototype) {
      return false;
    }
  } else {
    if (v.constructor && v.constructor !== Object) {
      return false;
    }
  }
  return true;
}


/**
 * Call connect method of the ConnectableObservable for all properties of props.
 * @param v The value to search
 */
const connect = (v: any) => {
  if (!v) {return;}

  if (v instanceof ConnectableObservable) {
    return v.connect && v.connect();
  }

  if (!isEnumerable(v)) {return}

  forIn(v, (v, k) => {
    if (!v) {return;}
    if (v instanceof ConnectableObservable && v.connect) {
      v.connect();
    } else if (isArray(v)) {
      v.forEach(connect);
    } else if (isObject(v)) {
      if (!isEnumerable(v)) {
        return;
      }
      forIn(v, connect);
    }
  })
}


/**
 * Required props for Context Component.
 */
export interface ContextProps {
  injector?: Injector;
  modules?: Module[]
}


/**
 * React context provider.
 */
export class Context extends React.Component<ContextProps, {}> {
  /**
   * Context object.
   */
  private contextObject: ContextType;


  public constructor(props, c) {
    super(props, c);
    const self = this;
    const injector: Injector = props.injector? props.injector: new Injector(props.modules);
    const subscription: Subscription = new Subscription();

    const ioModules: IOTypes = mapValues(injector.find(binding => {
      if (!binding.instance && binding.val) {
        return binding.val[IO_MARK];
      } else if (binding.instance) {
        return binding.instance[IO_MARK];
      }
    }), (v, k) => injector.get(k)) as IOTypes;

    const services: Service<any, any>[] = map(injector.find(binding => {
      if (binding.val) {
        return !!binding.val[SERVICE_MARK];
      }
    }), (v, k: string) => injector.get(k));

    this.contextObject = {
      createProps<T>(...args: any[]) {
        const ioResposens = mapValues(ioModules, v => v? v.response: null);
        return services.reduce((props, service) => {
          let result
          if (typeof service.initialize !== 'function') {
            result = service(ioResposens, injector, ...args);
          } else {
            result = service.initialize(ioResposens, injector, ...args);
          }

          forIn(ioModules, io => subscription.add(io.subscribe(result)));
          
          return assign(props, result['view'] || {});
        }, {});
      },
      clean() {
        subscription.unsubscribe();
      },
      connect,
      injector: injector,
      io: ioModules
    };
  }


  public render(): any {
    return this.props.children;
  }


  public componentWillUnmount() {
    this.contextObject.clean();
  }


  public getChildContext() {
    return this.contextObject;
  }


  static get childContextTypes() {
    return ContextReactTypes;
  }
}


/**
 * Decorator to set specified type as context type.
 * @param target A class constructor.
 */
export function context<T extends Function>(target: T) {
  target['contextTypes'] = ContextReactTypes;
}


/**
 * Set context type to stateless component.
 * @param component A stateless component.
 */
export function setContext(component: any): void {
  component['contextTypes'] = ContextReactTypes;
}
