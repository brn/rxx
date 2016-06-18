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
    var INJECTION_NAME_SYMBOL, SINGLETON_KEY, PROXIED_MARK, Injections, Injector;
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
             * The key to hold dependency name.
             */
            exports_1("INJECTION_NAME_SYMBOL", INJECTION_NAME_SYMBOL = symbol_1.Symbol('__injectionname__'));
            /**
             * The key to hold singleton instance.
             */
            SINGLETON_KEY = symbol_1.Symbol('__instance__');
            /**
             * The key to distinct proxied class.
             */
            PROXIED_MARK = symbol_1.Symbol('__proxied__');
            /**
             * Dependency definition.
             */
            Injections = (function () {
                /**
                 * @param ctor Constructor function.
                 */
                function Injections(ctor, inst) {
                    /**
                     * The name of depends class, instance, provider array.
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
                     * Return dependencies list.
                     * @returns The name of depends class, instance, provider array.
                     */
                    get: function () { return this.injectionList; },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Construct dependent name array.
                 * @param ctor Constructor function.
                 */
                Injections.prototype.initCtorInjections = function (ctor) {
                    this.extractInjectionTarget(ctor, inject_1.injectionTargetSymbol);
                    this.extractInjectionTarget(ctor, inject_1.dynamicTargetSymbol);
                };
                /**
                 * Construct dependent name array.
                 * @param ctor Constructor function.
                 */
                Injections.prototype.initInstanceInjections = function (inst) {
                    this.extractInjectionTarget(inst, inject_1.injectionTargetSymbol);
                    this.extractInjectionTarget(inst, inject_1.dynamicTargetSymbol);
                };
                /**
                 * Extract configs by symbol.
                 * @param target Target object.
                 * @param symbol Symbol object.
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
             * The main class.
             */
            Injector = (function () {
                /**
                 * @param modules The module array that is defined dependencies.
                 */
                function Injector(modules) {
                    /**
                     * Definition of bindings.
                     */
                    this.bindings = {};
                    /**
                     * Definition of interceptor bindings.
                     */
                    this.intercepts = [];
                    /**
                     * Definition of template bindings.
                     */
                    this.templates = {};
                    /**
                     * Definition of template.
                     */
                    this.templateDefinitions = {};
                    this.initialize(modules);
                }
                /**
                 * Iniaitlize modules and injector.
                 * @param modules The `Module` that are defined dependency relations.
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
                 * Instantiate eagerSingleton class.
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
                Injector.prototype.inject = function (ctor, params) {
                    var injections = new Injections(ctor);
                    return this.doCreate(ctor, injections, params);
                };
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
                Injector.prototype.injectToInstance = function (inst, params) {
                    if (inst[inject_1.injectionTargetSymbol]) {
                        var keyArgs = this.createArguments(new Injections(null, inst), params, true);
                        return lodash_1._.extend(inst, keyArgs);
                    }
                    return inst;
                };
                /**
                 * Resolve dependencies at once.
                 * If passed same constructor function twice,
                 * return first time instantiated instance.
                 * @param ctor Constructor function.
                 * @param params Additional dependencies.
                 */
                Injector.prototype.injectOnce = function (ctor, params) {
                    if (!ctor[SINGLETON_KEY]) {
                        ctor[SINGLETON_KEY] = this.inject(ctor, params);
                    }
                    return ctor[SINGLETON_KEY];
                };
                /**
                 * Create child injector.
                 * Child injector is binded parent modules and self modules.
                 * @param modules The new module to add.
                 */
                Injector.prototype.createChildInjector = function (modules) {
                    var injector = new Injector(modules);
                    injector.parent = this;
                    return injector;
                };
                /**
                 * Get instance from self and parents.
                 * @param key The key of dependency.
                 * @return The instance that created from found dependency.
                 */
                Injector.prototype.get = function (key) {
                    var instance = null;
                    var injector = this;
                    while (injector && !(instance = injector.getInstanceFromSelf(key))) {
                        injector = injector.parent;
                    }
                    return instance;
                };
                /**
                 * Get instance from self, not includes parents.
                 * @param key The key of dependency.
                 * @returns The instance that created from found dependency.
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
                /**
                 * Return all registered dependent names of self, not includes parents.
                 * @returns List of dependent names.
                 */
                Injector.prototype.selfKeys = function () {
                    return lodash_1._.map(this.bindings, function (binding, name) { return name; });
                };
                /**
                 * @return all registerd dependent names.
                 * @return List of dependent names.
                 */
                Injector.prototype.keys = function () {
                    var ret = [];
                    this.findOnParent(function (bindings) {
                        ret = ret.concat(lodash_1._.map(bindings, function (binding, name) { return name; }));
                        return true;
                    });
                    return ret;
                };
                /**
                 * Find bindings.
                 * @param predicate Predicate callback.
                 */
                Injector.prototype.find = function (predicate) {
                    var results = {};
                    this.findOnParent(function (bindings) {
                        lodash_1._.forIn(bindings, function (v, k) {
                            if (predicate(v, k)) {
                                results[k] = v;
                            }
                        });
                    });
                    return results;
                };
                /**
                 * Find bindings.
                 * @param predicate Predicate callback.
                 */
                Injector.prototype.findFromSelf = function (predicate) {
                    var results = {};
                    lodash_1._.forIn(this.bindings, function (v, k) {
                        if (predicate(v, k)) {
                            results[k] = v;
                        }
                    });
                    return results;
                };
                /**
                 * Create instance and resolve bindings.
                 * @param ctor Constructor function.
                 * @param injections Dependencies.
                 * @returns The instance that dependencies injected.
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
                 * Instantiate class.
                 * To fast instantiation, not use Function.prototype.apply but use switch case.
                 * @param ctor Constructor function.
                 * @param args Arguments.
                 * @return The instance that dependencies injected.
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
                 * Create arguments from bindings.
                 * @param injections Dependencies.
                 * @returns Array of dependencies.
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
                 * Search include parents `Injector`.
                 * Until passed callback return true, traverse parents.
                 * @param cb Callback function.
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
                 * Create binding from additional parameter.
                 * @param val defined value in Binding.
                 * @returns Binding definition.
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
                 * Create dependent instance.
                 * @param bindingName Instance name.
                 * @param item The defitnition of dependencies.
                 * @returns The instance that is constructed.
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
                 * Hook interceptor.
                 * @param Target instance.
                 */
                Injector.prototype.applyInterceptor = function (inst) {
                    var _this = this;
                    if (inst[PROXIED_MARK]) {
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
                            inst[PROXIED_MARK] = true;
                        }
                        return true;
                    });
                };
                /**
                 * Get interceptor instance.
                 * @param i Interceptor class.
                 * @returns INterceptor instance.
                 */
                Injector.prototype.getInterceptorInstance = function (i) {
                    if (!i.interceptor[SINGLETON_KEY]) {
                        return this.inject(i.interceptor);
                    }
                    return i.interceptor[SINGLETON_KEY];
                };
                /**
                 * Return wrapped method by interceptor.
                 * @param context Execution context.
                 * @param base Real method.
                 * @param interceptor Instance of interceptor.
                 * @param propertyKey Property name.
                 * @returns Wrapped function.
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
