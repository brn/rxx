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
}             from './classtype';
import {
  Binding,
  BindingRelation,
  Provider,
  InterceptPlaceholder
}             from './binding';
import {
  MethodInvocation,
  MethodProxy
}             from './method-proxy';
import {
  Module
}             from './module';
import {
  injectionTargetSymbol,
  dynamicTargetSymbol
}             from './inject';
import {
  Symbol
} from '../shims/symbol';
import {
  _
} from '../shims/lodash';


/**
 * The key to hold dependency name.
 */
export const INJECTION_NAME_SYMBOL = Symbol('__injectionname__');


/**
 * The key to hold singleton instance.
 */
const SINGLETON_KEY = Symbol('__instance__');


/**
 * The key to distinct proxied class.
 */
const PROXIED_GUARD_PROP = Symbol('__proxied__');


const PROXY_ID = Symbol('__proxy_id__');


let proxyIdValue = 0;


/**
 * Dependency definition.
 */
class Injections<T> {
  /**
   * The name of depends class, instance, provider array.
   */
  private injectionList: string[] = [];

  /**
   * @param ctor Constructor function.
   */
  constructor(ctor?: ClassType<T>, inst?: T) {
    if (!inst) {
      this.initCtorInjections(ctor);
    } else {
      this.initInstanceInjections(inst);
    }
  }

  /**
   * Return dependencies list.
   * @returns The name of depends class, instance, provider array.
   */
  public get injections() {return this.injectionList;}

  
  /**
   * Construct dependent name array.
   * @param ctor Constructor function.
   */
  private initCtorInjections(ctor: ClassType<T>): void {
    this.extractInjectionTarget(ctor, injectionTargetSymbol);
    this.extractInjectionTarget(ctor, dynamicTargetSymbol);
  }


  /**
   * Construct dependent name array.
   * @param ctor Constructor function.
   */
  private initInstanceInjections(inst: T): void {
    this.extractInjectionTarget(inst, injectionTargetSymbol);
    this.extractInjectionTarget(inst, dynamicTargetSymbol);
  }


  /**
   * Extract configs by symbol.
   * @param target Target object.
   * @param symbol Symbol object.
   */
  private extractInjectionTarget<T>(target: T, symbol: symbol) {
    var resources: any = target[symbol];
    if (!_.isArray(resources)) {
      if (!resources) {
        resources = [];
      } else {
        resources = [resources];
      }
    }
    this.injectionList = this.injectionList.concat(resources as string[]);
  }
}


/**
 * The main class.
 */
export class Injector {
  /**
   * Parent `Injector`.
   */
  private parent: Injector;

  /**
   * Definition of bindings.
   */
  private bindings: BindingRelation = {} as BindingRelation;

  /**
   * Definition of interceptor bindings.
   */
  private methodProxyDefs: InterceptPlaceholder[] = [];

  /**
   * Definition of template bindings.
   */
  private templates: BindingRelation = {};

  /**
   * Definition of template.
   */
  private templateDefinitions: {[key: string]: any} = {};


  private hasMethodProxyDefs = false;

  private singletons: {[key: number]: any} = {};

  /**
   * @param modules The module array that is defined dependencies.
   */
  constructor(modules: Module[]) {
    this.initialize(modules);
    this.hasMethodProxyDefs = this.hasInterceptors();
  }


  /**
   * Iniaitlize modules and injector.
   * @param modules The `Module` that are defined dependency relations.
   */
  private initialize(modules: Module[]): void {
    var obj: BindingRelation = {} as BindingRelation;
    _.forEach(modules, (mod: Module) => {
      mod.configure();
      _.extend(obj, mod.getBindings());
      _.extend(this.templates, mod.getTemplates());
      this.methodProxyDefs = this.methodProxyDefs.concat(mod.getIntercepts() || []);
    });
    obj['injector'] = this.fromParams(this);
    this.bindings = obj;
    this.instantiateEagerSingletons();
  }


  /**
   * Instantiate eagerSingleton class.
   */
  private instantiateEagerSingletons() {
    _.forIn(this.bindings, (v, k) => {
      if (v.eagerSingleton) {
        this.getInstanceFromSelf(k);
      }
    });

    _.forEach(this.methodProxyDefs, (proxy, k) => {
      proxy['interceptor'][PROXY_ID] = proxyIdValue++;
      if (proxy['eagerSingleton']) {
        this.getInterceptorInstance(proxy);
      }
    })
  }


  /**
   * Construct dependency resolved instance.
   *
   * @param ctor Constructor function
   * @param params Additional dependencies.
   * @returns Dependency resolved instance.
   * @example
   *
   * class Foo {...}
   * 
   * class Bar {
   *   @inject()
   *   private foo
   * 
   *   constructor() {}
   * }
   *
   * class TestModule extends AbstractModule {
   *   public configure() {
   *     this.bind('foo').to(Foo);
   *   }
   * }
   *
   * var injector = new Injector([new TestModule()]);
   *
   * //This call inject foo property of class Bar to module defined value.
   * injector.inject<Bar>(Bar);
   */
  public inject<T>(ctor: ClassType<T>, params?: any): T {
    var injections = new Injections<T>(ctor);
    return this.doCreate(ctor, injections, params);
  }


  /**
   * Inject dependency to instance.
   *
   * @param inst Instance.
   * @param params Additional dependencies.
   * @returns Dependency injected instance.
   * @example
   *
   * class Foo {...}
   * 
   * class Bar {
   *   @inject()
   *   private foo
   * 
   *   constructor() {}
   * }
   *
   * class TestModule extends AbstractModule {
   *   public configure() {
   *     this.bind('foo').to(Foo);
   *   }
   * }
   *
   * var injector = new Injector([new TestModule()]);
   *
   * //This call inject foo property of class Bar to module defined value.
   * injector.injectToInstance<Bar>(new Bar());
   */
  public injectToInstance<T>(inst: T, params?: any): T {
    if (inst[injectionTargetSymbol]) {
      let keyArgs = this.createArguments(new Injections<T>(null, inst), params, true) as {};
      return _.extend(inst, keyArgs) as any;
    }
    return inst;
  }


  /**
   * Resolve dependencies at once.
   * If passed same constructor function twice,
   * return first time instantiated instance.
   * @param ctor Constructor function.
   * @param params Additional dependencies.
   */
  public injectOnce<T>(ctor: ClassType<T>, params?: any): T {
    if (!ctor[SINGLETON_KEY]) {
      ctor[SINGLETON_KEY] = this.inject(ctor, params);
    }
    return ctor[SINGLETON_KEY];
  }


  /**
   * Create child injector.  
   * Child injector is binded parent modules and self modules.
   * @param modules The new module to add.
   */
  public createChildInjector(modules: Module[]) {
    const injector = new Injector(modules);
    injector.parent = this;
    injector.hasMethodProxyDefs = injector.hasInterceptors();
    return injector;
  }


  /**
   * Get instance from self and parents.
   * @param key The key of dependency.
   * @return The instance that created from found dependency.
   */
  public get(key: string|RegExp): any {
    let instance = null;
    let injector = this as Injector;
    while (injector && !(instance = injector.getInstanceFromSelf(key))) {
      injector = injector.parent;
    }
    return instance;
  }


  /**
   * Get instance from self, not includes parents.
   * @param key The key of dependency.
   * @returns The instance that created from found dependency.
   */
  public getInstanceFromSelf(key: string|RegExp): any {
    let ret;
    if (typeof key === 'string') {
      ret = _.filter(_.assign(this.bindings, this.templates) as any, (binding: Binding, name: string) => name === key)[0];
      let instance = ret? this.getInstance(key, null, ret, ret.template): null;
      return instance;
    } else {
      ret = [];
      _.forIn(_.assign(this.bindings, this.templates) as any, (binding: Binding, name: string) => {
        if ((key as RegExp).test(name)) {
          let instance = this.getInstance(name, null, binding, binding.template);
          ret.push(instance);
        }
      });
    }
    return ret;
  }


  /**
   * Return all registered dependent names of self, not includes parents.
   * @returns List of dependent names.
   */
  public selfKeys(): string[] {
    return _.map(this.bindings, (binding: Binding, name: string) => name);
  }


  /**
   * @return all registerd dependent names.
   * @return List of dependent names.
   */
  public keys(): string[] {
    let ret = [];
    this.findOnParent(injector => {
      ret = ret.concat(_.map(injector.bindings, (binding: Binding, name: string) => name));
      return true
    });
    return ret;
  }


  /**
   * Find bindings.
   * @param predicate Predicate callback.
   */
  public find(predicate: (binding: Binding, key: string) => boolean): {[key: string]: Binding} {
    const results = {} as {[key: string]: Binding};
    this.findOnParent(({bindings}) => {
      _.forIn(bindings, (v, k) => {
        if (predicate(v, k)) {
          results[k] = v;
        }
      });
      return true;
    });
    return results;
  }


  /**
   * Find bindings.
   * @param predicate Predicate callback.
   */
  public findFromSelf(predicate: (binding: Binding, key: string) => boolean): {[key: string]: Binding} {
    const results = {} as {[key: string]: Binding};
    _.forIn(this.bindings, (v, k) => {
      if (predicate(v, k)) {
        results[k] = v;
      }
      return true;
    });
    return results;
  }

  
  /**
   * Create instance and resolve bindings.
   * @param ctor Constructor function.
   * @param injections Dependencies.
   * @returns The instance that dependencies injected.
   */
  private doCreate<T>(ctor: ClassType<T>, injections: Injections<T>, params: any): T {
    let args = this.createArguments(injections, params, false) as any[];
    let ret = this.invokeNewCall(ctor, args) as T;
    if (ret[injectionTargetSymbol] || ret[dynamicTargetSymbol]) {
      let keyArgs = this.createArguments(new Injections<T>(null, ret), params, true) as {};
      _.assign(ret, keyArgs);
    }
    if (this.hasMethodProxyDefs) {
      this.applyInterceptor(ret);
    }
    if (ret && ret['postInit']) {
      ret['postInit']();
    }
    return ret;
  }


  /**
   * Instantiate class.  
   * To fast instantiation, not use Function.prototype.apply but use switch case.
   * @param ctor Constructor function.
   * @param args Arguments.
   * @return The instance that dependencies injected.
   */
  private invokeNewCall<T>(ctor: any, args: any[]): T {
    var instance: T;
    switch (args.length) {
    case 0:
      instance = new ctor();
      break;
    case 1:
      instance = new ctor(args[0]);
      break;
    case 2:
      instance = new ctor(args[0], args[1]);
      break;
    case 3:
      instance = new ctor(args[0], args[1], args[2]);
      break;
    case 4:
      instance = new ctor(args[0], args[1], args[2], args[3]);
      break;
    case 5:
      instance = new ctor(args[0], args[1], args[2], args[3], args[4]);
      break;
    case 6:
      instance = new ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
      break;
    case 7:
      instance = new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
      break;
    case 8:
      instance = new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
      break;
    case 9:
      instance = new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
      break;
    case 10:
      instance = new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
      break;
    default:
      var dummy = () => {}
      dummy.prototype = ctor.prototype;
      instance = new dummy;
      ctor.apply(instance, args);
    }
    return instance;
  }


  /**
   * Create arguments from bindings.
   * @param injections Dependencies.
   * @returns Array of dependencies.
   */
  private createArguments<T>(injections: Injections<T>, params: any, useKeys?: boolean): any[]|{} {
    const args = [];
    const keyArgs = {};
    const resources = injections.injections;
    const keys = params? _.keys(params): [];
    let bindingInfo;
    let bindingName;
    let dynamicName;
    let passProvider = false;
    let i = 0;
    let len;
    
    if (!resources) {return args;}

    for (i = 0, len = resources.length; i < len; i++) {
      var isDynamic = resources[i].length === 3;
      bindingName = resources[i][0];
      dynamicName = isDynamic? resources[i][1]: null;

      if (_.isRegExp(bindingName)) {
        var inner = [];
        this.findOnParent(({bindings, templates}) => {
          _.forEach(_.assign(bindings, templates) as any, (binding: Binding, name: string) => {
            bindingName.test(name) && inner.push(this.getInstance<T>(name, null, binding, false));
            _.forEach(keys, key => {
              if (bindingName.test(key)) {
                inner.push(this.getInstance<T>(key, null, this.fromParams(params[key]), false));
              }
            });
          });
          return true;
        })
        if (!useKeys) {
          args.push(inner);
        } else {
          keyArgs[resources[i][1]] = this.getInstance<T>(bindingName, null, item, false);
        }
      } else {
        var item;
        this.findOnParent(({bindings, templates}) => {
          item = bindings[bindingName] || templates[bindingName] || (params? this.fromParams(params[bindingName]): null);
          if (item) {
            return false;
          }
          return true;
        });

        if (!item) {
          args.push(null);
          continue;
        }

        if (!useKeys) {
          args.push(this.getInstance<T>(bindingName, dynamicName, item, isDynamic));
        } else {
          keyArgs[isDynamic? resources[i][2]: resources[i][1]] = this.getInstance<T>(bindingName, dynamicName, item, isDynamic);
        }
      }
    }
    return useKeys? keyArgs: args;
  }


  /**
   * Search include parents `Injector`.
   * Until passed callback return true, traverse parents.
   * @param cb Callback function.
   */
  private findOnParent(cb: (injector: Injector) => any) {
    let injector = this as Injector;
    let ret = [];
    while (injector) {
      const result = cb(injector);
      if (!result) {
        return ret;
      }
      ret.push(result);
      injector = injector.parent;
    }
    return ret;
  }


  /**
   * Create binding from additional parameter.
   * @param val defined value in Binding.
   * @returns Binding definition.
   */
  private fromParams(val: any): Binding {
    return {
      val: val,
      singleton: false,
      eagerSingleton: false,
      instance: true,
      provider: false,
      template: false,
      id: -1
    };
  }

  
  /**
   * Create dependent instance.
   * @param bindingName Instance name.
   * @param item The defitnition of dependencies.
   * @returns The instance that is constructed.
   */
  private getInstance<T>(bindingName: string, dynamicName: string, item: Binding, isTemplate: boolean): any {
    if (isTemplate && dynamicName && this.templateDefinitions[dynamicName]) {
      return this.templateDefinitions[dynamicName];
    }

    var ret;
    if (item && !item.instance && !item.provider) {
      if (item.singleton) {
        ret = this.getSingletonInstance(item.id);
        if (!ret) {
          ret = this.singletons[item.id] = this.inject(item.val);
          this.singletons[item.id][INJECTION_NAME_SYMBOL] = bindingName;
        }
      } else {
        var instance = this.inject(item.val);
        instance[INJECTION_NAME_SYMBOL] = bindingName;
        ret = instance;
      }
    } else if (item.instance){
      ret = item.val;
    } else if (item.provider) {
      var provider = this.inject<Provider<T>>(item.val);
      var provided = provider.provide();
      if (!_.isNil(provided)) {
        provided[INJECTION_NAME_SYMBOL] = bindingName; 
      }
      ret = provided;
    } else {
      ret = null;
    }

    if (this.hasMethodProxyDefs) {
      this.applyInterceptor(ret);
    }

    if (isTemplate && dynamicName) {
      this.templateDefinitions[dynamicName] = ret;
    }
    
    return ret;
  }


  /**
   * Hook interceptor.
   * @param Target instance.
   */
  private applyInterceptor<T>(inst: T): void {
    if (!inst) {return}

    this.findOnParent(({methodProxyDefs}) => {
      _.every(methodProxyDefs, (i: any) => {
        if (inst[i.targetSymbol]) {
          if (_.isRegExp(inst[i.targetSymbol][0])) {
            const regexp = inst[i.targetSymbol][0];
            _.forIn(inst, (v: Function, k) => {
              if (regexp.test(k)) {
                this.doApplyInterceptorIfNeccessary(inst, k, i);
              }
            });
          } else {
            _.forIn(inst[i.targetSymbol], (s: string) => {
              if (inst[s]) {
                if (typeof inst[s] !== 'function') {
                  throw new Error(`Interceptor only applyable to function.\nBut property ${s} is ${Object.prototype.toString.call(inst[s])}`);
                }
                this.doApplyInterceptorIfNeccessary(inst, s, i);
              }
            })
          }
        }
        return true;
      });
      return true;
    });
  }


  private doApplyInterceptorIfNeccessary(instance: any, method: string, proxyDef) {
    const interceptor = this.getInterceptorInstance(proxyDef);
    const id = `${method}:${interceptor[PROXY_ID]}`;
    if (!instance[PROXIED_GUARD_PROP]) {
      instance[PROXIED_GUARD_PROP] = {};
    }
    if (instance[PROXIED_GUARD_PROP][id]) {
      return;
    }
    instance[PROXIED_GUARD_PROP][id] = true;
    instance[method] = this.getMethodProxy(instance, instance[method], interceptor, method);
  }


  /**
   * Get interceptor instance.
   * @param i Interceptor class.
   * @returns INterceptor instance.
   */
  private getInterceptorInstance(i: any): MethodProxy {
    if (i.singleton) {
      let ret = this.getSingletonInstance(i.id);
      if (!ret) {
        return this.singletons[i.id] = this.inject(i.interceptor as new() => MethodProxy);
      }
      return ret as MethodProxy;
    }
    return this.inject(i.interceptor as new() => MethodProxy);
  }


  /**
   * Return wrapped method by interceptor.
   * @param context Execution context.
   * @param base Real method.
   * @param interceptor Instance of interceptor.
   * @param propertyKey Property name.
   * @returns Wrapped function.
   */
  private getMethodProxy(context: any, base: Function, interceptor: MethodProxy, propertyKey: string): (...args: any[]) => any {
    return (...args) => {
      return interceptor.invoke(new MethodInvocation(base, context, args, context[INJECTION_NAME_SYMBOL], propertyKey));
    }
  }


  private hasInterceptors() {
    let has = false;
    this.findOnParent(({methodProxyDefs}) => {
      has = methodProxyDefs.length > 0;
      return has? false: true;
    });
    return has;
  }


  private getSingletonInstance(id: number) {
    let instance = null;
    this.findOnParent(injector => {
      if (injector.singletons[id]) {
        instance = injector.singletons[id];
        return false;
      }
      return true;
    });
    return instance;
  }
}
