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
  ClassType
} from './classtype';
import {
  MethodInvocation,
  MethodProxy
} from './method-proxy';



/**
 * Binding definition.
 */
export interface Binding {
  /**
   * Defined value.
   */
  val: any;
  
  /**
   * Singleton or not.
   */
  singleton: boolean;

  /**
   * EagerSingleton or not.
   */
  eagerSingleton: boolean;

  /**
   * Immediate value or not.
   */
  instance: boolean;

  /**
   * Provider or not.
   */
  provider: boolean;

  /**
   * Template or not.
   */
  template: boolean;

  /**
   * Binding unique id.
   */
  id: number;
}


/**
 * Dictionary to look up config from bindings.
 */
export interface BindingRelation {
  [index: string]: Binding;
}


/**
 * The interface of Provider.
 */
export interface Provider<T> {
  /**
   * Create instance.
   * @return Create instance.
   */
  provide(): T;
}


/**
 * Options for class type.
 */
export class ClassTypeOption {
  public constructor(private binding: Binding) {}

  /**
   * Make class singleton.
   */
  public asSingleton() {
    this.binding.singleton = true;
  }

  /**
   * Make class eager singleton.
   */
  public asEagerSingleton() {
    this.binding.singleton = true;
    this.binding.eagerSingleton = true;
  }
}


let bindingId = 0;


/**
 * Link binding to value.
 */
export class BindingPlaceholder {
  /**
   * @param id Binding id.
   * @param holder Bindings map.
   */
  constructor(private id: string,
              private holder: BindingRelation) {}
  

  /**
   * Link constructor function to binding id.
   * @param ctor Constructor function.
   * @returns Option.
   */
  public to<T>(ctor: any);
  public to<T>(ctor: ClassType<T>): ClassTypeOption {
    this.holder[this.id] = {val: ctor, singleton: false, eagerSingleton: false, instance: false, provider: false, template: false, id: bindingId++};
    return new ClassTypeOption(this.holder[this.id]);
  }

  
  /**
   * Link instance to binding id.
   * @param value Immediate value.
   */
  public toInstance<T>(value: T) {
    this.holder[this.id] = {val: value, singleton: false, eagerSingleton: false, instance: true, provider: false, template: false, id: bindingId++};
  }


  /**
   * Link Provider to binding id.
   * @param value Provider constructor function.
   */
  public toProvider<T>(value: ClassType<Provider<T>>) {
    this.holder[this.id] = {val: value, singleton: false, eagerSingleton: false, instance: false, provider: true, template: false, id: bindingId++}
  }
}


/**
 * Hold interceptor and value.
 */
export class InterceptPlaceholder {
  /**
   * Interceptor function.
   */
  private interceptor: new() => MethodProxy;

  /**
   * Singleton flag.
   */
  private singleton = false;

  /**
   * Eager singleton flag.
   */
  private eagerSingleton = false;

  private id = bindingId++;

  /**
   * @param targetSymbol The symbol that set to intercepted.
   */
  public constructor(private targetSymbol: symbol) {}

  /**
   * Do binding.
   * @param methodProxyCtor MethodProxy constructor funciton.
   */
  public to(methodProxyCtor: new() => MethodProxy): ClassTypeOption {
    this.interceptor = methodProxyCtor;
    return new ClassTypeOption(this as any);
  }
}


/**
 * Hold template definitions and values.
 */
export class TemplatePlaceholder {
  /**
   * @param id Template id.
   * @param holder Object that hold bindings.
   */
  constructor(private id: string,
              private holder: BindingRelation) {}


  /**
   * Link template to binding id.
   * @param ctor Constructor function.
   */
  public to<T>(ctor: ClassType<T>) {
    this.holder[this.id] = {val: ctor, singleton: false, eagerSingleton: false, instance: false, provider: false, template: true, id: bindingId++};
  }
}
