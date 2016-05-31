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
System.register(['./method-proxy', './inject', '../shims/symbol', '../shims/lodash'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var method_proxy_1, inject_1, symbol_1, lodash_1;
    var INJECTION_NAME_SYMBOL, SINGLETON_KEY, PROXIED_MARD, Injections, Injector;
    return {
        setters:[
            function (method_proxy_1_1) {
                method_proxy_1 = method_proxy_1_1;
            },
            function (inject_1_1) {
                inject_1 = inject_1_1;
            },
            function (symbol_1_1) {
                symbol_1 = symbol_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            /**
             * di時に使用された名前を格納するキー
             */
            exports_1("INJECTION_NAME_SYMBOL", INJECTION_NAME_SYMBOL = symbol_1.Symbol('__injectionname__'));
            /**
             * シングルトンオブジェクトのインスタンスを格納するキー
             */
            SINGLETON_KEY = symbol_1.Symbol('__instance__');
            /**
             * インターセプタ適用済みの印
             */
            PROXIED_MARD = symbol_1.Symbol('__proxied__');
            /**
             * 依存性の定義
             */
            Injections = (function () {
                /**
                 * @param ctor コンストラクタ関数
                 */
                function Injections(ctor, inst) {
                    /**
                     * 依存しているクラス、インスタンス、プロバイダ名の配列
                     */
                    this.injectionList = [];
                    if (!inst) {
                        this.initCtorInjections(ctor);
                    }
                    else {
                        this.initInstanceInjections(inst);
                    }
                }
                Object.defineProperty(Injections.prototype, "injections", {
                    /**
                     * 依存リストを返す
                     * @returns 依存しているクラス、インスタンス、プロバイダ名の配列
                     */
                    get: function () { return this.injectionList; },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * 依存名の配列を構築する
                 * @param ctor コンストラクタ関数
                 */
                Injections.prototype.initCtorInjections = function (ctor) {
                    this.extractInjectionTarget(ctor, inject_1.injectionTargetSymbol);
                    this.extractInjectionTarget(ctor, inject_1.dynamicTargetSymbol);
                };
                /**
                 * 依存名の配列を構築する
                 * @param ctor コンストラクタ関数
                 */
                Injections.prototype.initInstanceInjections = function (inst) {
                    this.extractInjectionTarget(inst, inject_1.injectionTargetSymbol);
                    this.extractInjectionTarget(inst, inject_1.dynamicTargetSymbol);
                };
                /**
                 * 指定されたsymbolをキーにdiの設定を抽出する。
                 * @param target 対象オブジェクト
                 * @param symbol symbolオブジェクト
                 */
                Injections.prototype.extractInjectionTarget = function (target, symbol) {
                    var resources = target[symbol];
                    if (!lodash_1._.isArray(resources)) {
                        if (!resources) {
                            resources = [];
                        }
                        else {
                            resources = [resources];
                        }
                    }
                    this.injectionList = this.injectionList.concat(resources);
                };
                return Injections;
            }());
            /**
             * diを実行するメインクラス
             */
            Injector = (function () {
                /**
                 * @param modules 依存関係を定義したモジュールの配列
                 */
                function Injector(modules) {
                    /**
                     * バインディングの定義
                     */
                    this.bindings = {};
                    /**
                     * インターセプタのバインディング定義
                     */
                    this.intercepts = [];
                    /**
                     * テンプレートのバインディング定義
                     */
                    this.templates = {};
                    /**
                     * テンプレート定義
                     */
                    this.templateDefinitions = {};
                    this.initialize(modules);
                }
                /**
                 * 初期化処理を行う
                 * @param modules バインディング定義が記述された`Module`
                 */
                Injector.prototype.initialize = function (modules) {
                    var _this = this;
                    var obj = {};
                    lodash_1._.forEach(modules, function (mod) {
                        mod.configure();
                        lodash_1._.extend(obj, mod.getBindings());
                        lodash_1._.extend(_this.templates, mod.getTemplates());
                        _this.intercepts = _this.intercepts.concat(mod.getIntercepts() || []);
                    });
                    obj['injector'] = this.fromParams(this);
                    this.bindings = obj;
                    this.instantiateEagerSingletons();
                };
                /**
                 * eagerSingletonのインスタンスを作成しておく
                 */
                Injector.prototype.instantiateEagerSingletons = function () {
                    var _this = this;
                    lodash_1._.forIn(this.bindings, function (v, k) {
                        if (v.eagerSingleton) {
                            _this.getInstanceFromSelf(k);
                        }
                    });
                };
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
                Injector.prototype.inject = function (ctor, params) {
                    var injections = new Injections(ctor);
                    return this.doCreate(ctor, injections, params);
                };
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
                Injector.prototype.injectToInstance = function (inst, params) {
                    if (inst[inject_1.injectionTargetSymbol]) {
                        var keyArgs = this.createArguments(new Injections(null, inst), params, true);
                        return lodash_1._.extend(inst, keyArgs);
                    }
                    return inst;
                };
                /**
                 * 一度だけ依存性を解決する、二度目以降に同じコンストラクタ関数が渡された場合は、
                 * 初回に生成したインスタンスを返す。
                 * @param ctor コンストラクタ関数
                 * @param params 追加の依存性
                 */
                Injector.prototype.injectOnce = function (ctor, params) {
                    if (!ctor[SINGLETON_KEY]) {
                        ctor[SINGLETON_KEY] = this.inject(ctor, params);
                    }
                    return ctor[SINGLETON_KEY];
                };
                /**
                 * 既存の`Injector`インスタンスから新たな`Injector`を生成する。
                 * @param modules 新たに追加する`Module`
                 */
                Injector.prototype.createChildInjector = function (modules) {
                    var injector = new Injector(modules);
                    injector.parent = this;
                    return injector;
                };
                Injector.prototype.get = function (key) {
                    var instance = null;
                    var injector = this;
                    while (injector && !(instance = injector.getInstanceFromSelf(key))) {
                        injector = injector.parent;
                    }
                    return instance;
                };
                /**
                 * 自分自身からバインディング定義を検索してインスタンスを生成する。
                 * この際、親の`Injector`の定義は参照しない。
                 * @param key 検索するバインディング定義
                 * @returns 見つかった定義から生成したインスタンス
                 */
                Injector.prototype.getInstanceFromSelf = function (key) {
                    var _this = this;
                    var ret;
                    if (typeof key === 'string') {
                        ret = lodash_1._.filter(lodash_1._.assign(this.bindings, this.templates), function (binding, name) { return name === key; })[0];
                        var instance = ret ? this.getInstance(key, null, ret, ret.template) : null;
                        return instance;
                    }
                    else {
                        ret = [];
                        lodash_1._.forIn(lodash_1._.assign(this.bindings, this.templates), function (binding, name) {
                            if (key.test(name)) {
                                var instance = _this.getInstance(name, null, binding, binding.template);
                                ret.push(instance);
                            }
                        });
                    }
                    return ret;
                };
                Injector.prototype.selfKeys = function () {
                    return lodash_1._.map(this.bindings, function (binding, name) { return name; });
                };
                Injector.prototype.keys = function () {
                    var ret = [];
                    this.findOnParent(function (bindings) {
                        ret = ret.concat(lodash_1._.map(bindings, function (binding, name) { return name; }));
                        return true;
                    });
                    return ret;
                };
                /**
                 * インスタンスの生成とbindingの解決を行う
                 * @param ctor コンストラクタ関数
                 * @param injections 依存性
                 * @returns 依存性を注入したインスタンス
                 */
                Injector.prototype.doCreate = function (ctor, injections, params) {
                    var args = this.createArguments(injections, params, false);
                    var ret = this.invokeNewCall(ctor, args);
                    if (ret[inject_1.injectionTargetSymbol] || ret[inject_1.dynamicTargetSymbol]) {
                        var keyArgs = this.createArguments(new Injections(null, ret), params, true);
                        lodash_1._.assign(ret, keyArgs);
                    }
                    if (this.intercepts.length > 0) {
                        this.applyInterceptor(ret);
                    }
                    if (ret && ret['postInit']) {
                        ret['postInit']();
                    }
                    return ret;
                };
                /**
                 * インスタンス生成
                 * 速度のために、Function.prototype.applyを使わずに引数の数で分岐する。
                 * @param ctor コンストラクタ関数
                 * @param args 引数
                 * @return 依存性を注入したインスタンス
                 */
                Injector.prototype.invokeNewCall = function (ctor, args) {
                    var instance;
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
                            var dummy = function () { };
                            dummy.prototype = ctor.prototype;
                            instance = new dummy;
                            ctor.apply(instance, args);
                    }
                    return instance;
                };
                /**
                 * 引数の自動生成を行う
                 * @param injections 依存性
                 * @returns 依存性の配列
                 */
                Injector.prototype.createArguments = function (injections, params, useKeys) {
                    var _this = this;
                    var args = [];
                    var keyArgs = {};
                    var resources = injections.injections;
                    var keys = params ? lodash_1._.keys(params) : [];
                    var bindingInfo;
                    var bindingName;
                    var dynamicName;
                    var passProvider = false;
                    var i = 0;
                    var len;
                    if (!resources) {
                        return args;
                    }
                    for (i = 0, len = resources.length; i < len; i++) {
                        var isDynamic = resources[i].length === 3;
                        bindingName = resources[i][0];
                        dynamicName = isDynamic ? resources[i][1] : null;
                        if (lodash_1._.isRegExp(bindingName)) {
                            var inner = [];
                            this.findOnParent(function (bindings, templates) {
                                lodash_1._.forEach(lodash_1._.assign(bindings, templates), function (binding, name) {
                                    bindingName.test(name) && inner.push(_this.getInstance(name, null, binding, false));
                                    lodash_1._.forEach(keys, function (key) {
                                        if (bindingName.test(key)) {
                                            inner.push(_this.getInstance(key, null, _this.fromParams(params[key]), false));
                                        }
                                    });
                                });
                                return true;
                            });
                            if (!useKeys) {
                                args.push(inner);
                            }
                            else {
                                keyArgs[resources[i][1]] = this.getInstance(bindingName, null, item, false);
                            }
                        }
                        else {
                            var item;
                            this.findOnParent(function (bindings, templates) {
                                item = bindings[bindingName] || templates[bindingName] || (params ? _this.fromParams(params[bindingName]) : null);
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
                                args.push(this.getInstance(bindingName, dynamicName, item, isDynamic));
                            }
                            else {
                                keyArgs[isDynamic ? resources[i][2] : resources[i][1]] = this.getInstance(bindingName, dynamicName, item, isDynamic);
                            }
                        }
                    }
                    return useKeys ? keyArgs : args;
                };
                /**
                 * 親の`Injector`を含めて検索する
                 * 引数で渡された関数がtrueを返す限り親をたどり続ける
                 * @param cb コールバック関数
                 */
                Injector.prototype.findOnParent = function (cb) {
                    var injector = this;
                    while (injector) {
                        var ret = cb(injector.bindings, injector.templates);
                        if (!ret) {
                            return;
                        }
                        injector = injector.parent;
                    }
                };
                /**
                 * `Injector#inject`等の引数で渡された追加の依存性から、バインディング定義を生成する
                 * @param val バインディング定義の値
                 * @returns バインディング定義
                 */
                Injector.prototype.fromParams = function (val) {
                    return {
                        val: val,
                        singleton: false,
                        eagerSingleton: false,
                        instance: true,
                        provider: false,
                        template: false
                    };
                };
                /**
                 * 依存しているインスタンスの生成
                 * @param bindingName インスタンス名
                 * @param item バインディングの定義
                 * @returns 構築済みインスタンス
                 */
                Injector.prototype.getInstance = function (bindingName, dynamicName, item, isTemplate) {
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
                        }
                        else {
                            var instance = this.inject(item.val);
                            instance[INJECTION_NAME_SYMBOL] = bindingName;
                            ret = instance;
                        }
                    }
                    else if (item.instance) {
                        ret = item.val;
                    }
                    else if (item.provider) {
                        var provider = this.inject(item.val);
                        var provided = provider.provide();
                        if (!lodash_1._.isNil(provided)) {
                            provided[INJECTION_NAME_SYMBOL] = bindingName;
                        }
                        ret = provided;
                    }
                    else {
                        ret = null;
                    }
                    if (this.intercepts.length > 0) {
                        this.applyInterceptor(ret);
                    }
                    if (isTemplate && dynamicName) {
                        this.templateDefinitions[dynamicName] = ret;
                    }
                    return ret;
                };
                /**
                 * インターセプタをフックする
                 * @param フックする対象インスタンス
                 */
                Injector.prototype.applyInterceptor = function (inst) {
                    var _this = this;
                    if (inst[PROXIED_MARD]) {
                        return;
                    }
                    lodash_1._.every(this.intercepts, function (i) {
                        if (inst[i.targetSymbol]) {
                            if (lodash_1._.isRegExp(inst[i.targetSymbol][0])) {
                                var regexp_1 = inst[i.targetSymbol][0];
                                lodash_1._.forIn(inst, function (v, k) {
                                    if (regexp_1.test(k)) {
                                        inst[k] = _this.getMethodProxy(inst, v, _this.getInterceptorInstance(i), k);
                                    }
                                });
                                return false;
                            }
                            else {
                                lodash_1._.forIn(inst[i.targetSymbol], function (s) {
                                    if (inst[s]) {
                                        if (typeof inst[s] !== 'function') {
                                            throw new Error("Interceptor only applyable to function.\nBut property " + s + " is " + Object.prototype.toString.call(inst[s]));
                                        }
                                        inst[s] = _this.getMethodProxy(inst, inst[s], _this.getInterceptorInstance(i), s);
                                    }
                                });
                            }
                            inst[PROXIED_MARD] = true;
                        }
                        return true;
                    });
                };
                /**
                 * インターセプタ自体のインスタンスを取得する
                 * @param i インターセプタクラス
                 * @returns インターセプタのインスタンス
                 */
                Injector.prototype.getInterceptorInstance = function (i) {
                    if (!i.interceptor[SINGLETON_KEY]) {
                        return this.inject(i.interceptor);
                    }
                    return i.interceptor[SINGLETON_KEY];
                };
                /**
                 * インターセプタでラップしたメソッドを返す。
                 * @param context 実行コンテキスト
                 * @param base 実際のメソッド
                 * @param interceptor インターセプタインスタンス
                 * @param propertyKey プロパティ名
                 * @returns ラップされた関数
                 */
                Injector.prototype.getMethodProxy = function (context, base, interceptor, propertyKey) {
                    return function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i - 0] = arguments[_i];
                        }
                        return interceptor.invoke(new method_proxy_1.MethodInvocation(base, context, args, context[INJECTION_NAME_SYMBOL], propertyKey));
                    };
                };
                return Injector;
            }());
            exports_1("Injector", Injector);
        }
    }
});
