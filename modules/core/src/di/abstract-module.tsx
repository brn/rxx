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
  Binding,
  BindingRelation,
  BindingPlaceholder,
  TemplatePlaceholder,
  InterceptPlaceholder
} from './binding';
import {
  Module
} from './module';
import {
  _
} from '../shims/lodash';


/**
 * Base implementation of `Module`.
 */
export abstract class AbstractModule implements Module {
  /**
   * Map of bindings.
   */
  private bindings: BindingRelation = {};

  /**
   * Map of template.
   */
  private templates: BindingRelation = {};

  /**
   * Map of interceptor.
   */
  private intercepts: InterceptPlaceholder[] = [];


  /**
   * Define binding id.
   * @param name Binding id.
   * @returns Concrete class.
   */
  public bind(name: string): BindingPlaceholder {
    return new BindingPlaceholder(name, this.bindings);
  }


  /**
   * Define template id.
   * @param name Template binding id.
   */
  public template(name: string): TemplatePlaceholder {
    return new TemplatePlaceholder(name, this.templates);
  }


  /**
   * Register interceptor Symbol.
   * @param targetSymbol Symbol that set interceptor target.
   */
  public bindInterceptor(targetSymbol: symbol) {
    const p = new InterceptPlaceholder(targetSymbol);
    this.intercepts.push(p);
    return p;
  }


  /**
   * Return binding map.
   * @returns Binding definitions.
   */
  public getBindings(): BindingRelation {
    return this.bindings;
  }


  /**
   * Return template map.
   * @returns Template definitions.
   */
  public getTemplates(): BindingRelation {
    return this.templates;
  }


  /**
   * Get list of symbol that interceptor target.
   * @returns Definition of binding of interceptor.
   */
  public getIntercepts(): InterceptPlaceholder[] {
    return this.intercepts;
  }


  /**
   * Configure binding of modules.
   * @override
   */
  public abstract configure(): void


  /**
   * Mixin other module configs.
   * @param m Module.
   */
  public mixin(m: AbstractModule): void {
    m.configure();
    _.extend(this.bindings, m.getBindings());
  }
}


/**
 * Simple utility function that create module.
 * @param fn The configure method body.
 * @returns Module implementation.
 */
export function createModule(fn: (config: AbstractModule) => void): Module {
  return new (class extends AbstractModule {
    configure() {
      fn(this);
    }
  });
}
