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
import * as _ from 'lodash';
import {
  injectionTargetSymbol,
  dynamicTargetSymbol
}             from './inject';


/**
 * di時に使用された名前を格納するキー
 */
export const INJECTION_NAME_SYMBOL = Symbol('__injectionname__');


/**
 * シングルトンオブジェクトのインスタンスを格納するキー
 */
const SINGLETON_KEY = Symbol('__instance__');


/**
 * インターセプタ適用済みの印
 */
const PROXIED_MARD = Symbol('__proxied__');


/**
 * 依存性の定義
 */
class Injections<T> {
  /**
   * 依存しているクラス、インスタンス、プロバイダ名の配列
   */
  private injectionList: string[] = [];

  /**
   * @param ctor コンストラクタ関数
   */
  constructor(ctor?: ClassType<T>, inst?: T) {
    if (!inst) {
      this.initCtorInjections(ctor);
    } else {
      this.initInstanceInjections(inst);
    }
  }

  /**
   * 依存リストを返す
   * @returns 依存しているクラス、インスタンス、プロバイダ名の配列
   */
  public get injections() {return this.injectionList;}

  
  /**
   * 依存名の配列を構築する
   * @param ctor コンストラクタ関数
   */
  private initCtorInjections(ctor: ClassType<T>): void {
    this.extractInjectionTarget(ctor, injectionTargetSymbol);
    this.extractInjectionTarget(ctor, dynamicTargetSymbol);
  }


  /**
   * 依存名の配列を構築する
   * @param ctor コンストラクタ関数
   */
  private initInstanceInjections(inst: T): void {
    this.extractInjectionTarget(inst, injectionTargetSymbol);
    this.extractInjectionTarget(inst, dynamicTargetSymbol);
  }


  /**
   * 指定されたsymbolをキーにdiの設定を抽出する。
   * @param target 対象オブジェクト
   * @param symbol symbolオブジェクト
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
 * diを実行するメインクラス
 */
export class Injector {
  /**
   * 親の`Injector`
   */
  private parent: Injector;

  /**
   * バインディングの定義
   */
  private bindings: BindingRelation = {} as BindingRelation;

  /**
   * インターセプタのバインディング定義
   */
  private intercepts: InterceptPlaceholder[] = [];

  /**
   * テンプレートのバインディング定義
   */
  private templates: BindingRelation = {};

  /**
   * テンプレート定義
   */
  private templateDefinitions: {[key: string]: any} = {};

  /**
   * @param modules 依存関係を定義したモジュールの配列
   */
  constructor(modules: Module[]) {
    this.initialize(modules)
  }


  /**
   * 初期化処理を行う
   * @param modules バインディング定義が記述された`Module`
   */
  private initialize(modules: Module[]): void {
    var obj: BindingRelation = {} as BindingRelation;
    _.forEach(modules, (mod: Module) => {
      mod.configure();
      _.extend(obj, mod.getBindings());
      _.extend(this.templates, mod.getTemplates());
      this.intercepts = this.intercepts.concat(mod.getIntercepts() || []);
    });
    obj['injector'] = this.fromParams(this);
    this.bindings = obj;
    this.instantiateEagerSingletons();
  }


  /**
   * eagerSingletonのインスタンスを作成しておく
   */
  private instantiateEagerSingletons() {
    _.forIn(this.bindings, (v, k) => {
      if (v.eagerSingleton) {
        this.getInstanceFromSelf(k);
      }
    })
  }


  /**
   * 依存性を解決した上でインスタンスを生成する。
   *
   * @param ctor コンストラクタ関数
   * @param params 追加の依存性
   * @returns 依存性を注入したインスタンス
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
   * var injector = new Injector(new TestModule());
   *
   * //この呼出でBarクラスの引数fooにModuleで指定されている値が自動で注入される。
   * injector.inject<Bar>(Bar);
   */
  public inject<T>(ctor: ClassType<T>, params?: any): T {
    var injections = new Injections<T>(ctor);
    return this.doCreate(ctor, injections, params);
  }


  /**
   * 生成されたインスタンスに依存性を注入する
   *
   * @param ctor コンストラクタ関数
   * @param params 追加の依存性
   * @returns 依存性を注入したインスタンス
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
   * var injector = new Injector(new TestModule());
   *
   * //この呼出でBarクラスの引数fooにModuleで指定されている値が自動で注入される。
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
   * 一度だけ依存性を解決する、二度目以降に同じコンストラクタ関数が渡された場合は、  
   * 初回に生成したインスタンスを返す。
   * @param ctor コンストラクタ関数
   * @param params 追加の依存性
   */
  public injectOnce<T>(ctor: ClassType<T>, params?: any): T {
    if (!ctor[SINGLETON_KEY]) {
      ctor[SINGLETON_KEY] = this.inject(ctor, params);
    }
    return ctor[SINGLETON_KEY];
  }


  /**
   * 既存の`Injector`インスタンスから新たな`Injector`を生成する。
   * @param modules 新たに追加する`Module`
   */
  public createChildInjector(modules: Module[]) {
    const injector = new Injector(modules);
    injector.parent = this;
    return injector;
  }


  public get(key: string|RegExp): any {
    let instance = null;
    let injector = this as Injector;
    while (injector && !(instance = injector.getInstanceFromSelf(key))) {
      injector = injector.parent;
    }
    return instance;
  }


  /**
   * 自分自身からバインディング定義を検索してインスタンスを生成する。  
   * この際、親の`Injector`の定義は参照しない。
   * @param key 検索するバインディング定義
   * @returns 見つかった定義から生成したインスタンス
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


  public selfKeys(): string[] {
    return _.map(this.bindings, (binding: Binding, name: string) => name);
  }


  public keys(): string[] {
    let ret = [];
    this.findOnParent(bindings => {
      ret = ret.concat(_.map(bindings, (binding: Binding, name: string) => name));
      return true
    });
    return ret;
  }

  
  /**
   * インスタンスの生成とbindingの解決を行う
   * @param ctor コンストラクタ関数
   * @param injections 依存性
   * @returns 依存性を注入したインスタンス
   */
  private doCreate<T>(ctor: ClassType<T>, injections: Injections<T>, params: any): T {
    let args = this.createArguments(injections, params, false) as any[];
    let ret = this.invokeNewCall(ctor, args) as T;
    if (ret[injectionTargetSymbol] || ret[dynamicTargetSymbol]) {
      let keyArgs = this.createArguments(new Injections<T>(null, ret), params, true) as {};
      _.assign(ret, keyArgs);
    }
    if (this.intercepts.length > 0) {
      this.applyInterceptor(ret);
    }
    if (ret && ret['postInit']) {
      ret['postInit']();
    }
    return ret;
  }


  /**
   * インスタンス生成  
   * 速度のために、Function.prototype.applyを使わずに引数の数で分岐する。
   * @param ctor コンストラクタ関数
   * @param args 引数
   * @return 依存性を注入したインスタンス
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
   * 引数の自動生成を行う
   * @param injections 依存性
   * @returns 依存性の配列
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
        this.findOnParent((bindings, templates) => {
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
        this.findOnParent((bindings, templates) => {
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
   * 親の`Injector`を含めて検索する  
   * 引数で渡された関数がtrueを返す限り親をたどり続ける
   * @param cb コールバック関数
   */
  private findOnParent(cb: Function) {
    var injector = this as Injector;
    while (injector) {
      var ret = cb(injector.bindings, injector.templates);
      if (!ret) {
        return;
      }
      injector = injector.parent;
    }
  }


  /**
   * `Injector#inject`等の引数で渡された追加の依存性から、バインディング定義を生成する
   * @param val バインディング定義の値
   * @returns バインディング定義
   */
  private fromParams(val: any): Binding {
    return {
      val: val,
      singleton: false,
      eagerSingleton: false,
      instance: true,
      provider: false,
      template: false
    };
  }

  
  /**
   * 依存しているインスタンスの生成
   * @param bindingName インスタンス名
   * @param item バインディングの定義
   * @returns 構築済みインスタンス
   */
  private getInstance<T>(bindingName: string, dynamicName: string, item: Binding, isTemplate: boolean): any {
    if (isTemplate && dynamicName && this.templateDefinitions[dynamicName]) {
      return this.templateDefinitions[dynamicName];
    }

    var ret;
    if (item && !item.instance && !item.provider) {
      if (item.singleton) {
        if (!item['_instance']) {
          item['_instance'] = this.inject(item.val);
          item['_instance'][INJECTION_NAME_SYMBOL] = bindingName;
        }
        ret = item['_instance'];
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

    if (this.intercepts.length > 0) {
      this.applyInterceptor(ret);
    }

    if (isTemplate && dynamicName) {
      this.templateDefinitions[dynamicName] = ret;
    }
    
    return ret;
  }


  /**
   * インターセプタをフックする
   * @param フックする対象インスタンス
   */
  private applyInterceptor<T>(inst: T): void {
    if (inst[PROXIED_MARD]) {
      return;
    }

    _.every(this.intercepts, (i: any) => {
      if (inst[i.targetSymbol]) {
        if (_.isRegExp(inst[i.targetSymbol][0])) {
          const regexp = inst[i.targetSymbol][0];
          _.forIn(inst, (v, k) => {
            if (regexp.test(k)) {
              inst[k] = this.getMethodProxy(inst, v, this.getInterceptorInstance(i), k);
            }
          })
          return false;
        } else {
          _.forIn(inst[i.targetSymbol], s => {
            if (inst[s]) {
              if (typeof inst[s] !== 'function') {
                throw new Error(`Interceptor only applyable to function.\nBut property ${s} is ${Object.prototype.toString.call(inst[s])}`);
              }
              inst[s] = this.getMethodProxy(inst, inst[s], this.getInterceptorInstance(i), s);
            }
          })
        }
        inst[PROXIED_MARD] = true;
      }
      return true;
    });
  }


  /**
   * インターセプタ自体のインスタンスを取得する
   * @param i インターセプタクラス
   * @returns インターセプタのインスタンス
   */
  private getInterceptorInstance(i: any): MethodProxy {
    if (!i.interceptor[SINGLETON_KEY]) {
      return this.inject(i.interceptor as new() => MethodProxy);
    }
    return i.interceptor[SINGLETON_KEY] as MethodProxy;
  }


  /**
   * インターセプタでラップしたメソッドを返す。
   * @param context 実行コンテキスト
   * @param base 実際のメソッド
   * @param interceptor インターセプタインスタンス
   * @param propertyKey プロパティ名
   * @returns ラップされた関数
   */
  private getMethodProxy(context: any, base: Function, interceptor: MethodProxy, propertyKey: string): (...args: any[]) => any {
    return (...args) => {
      return interceptor.invoke(new MethodInvocation(base, context, args, context[INJECTION_NAME_SYMBOL], propertyKey));
    }
  }
}
