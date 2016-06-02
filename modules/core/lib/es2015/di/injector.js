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
import { MethodInvocation } from './method-proxy';
import { injectionTargetSymbol, dynamicTargetSymbol } from './inject';
import { Symbol } from '../shims/symbol';
import { _ } from '../shims/lodash';
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
const PROXIED_MARK = Symbol('__proxied__');
/**
 * Dependency definition.
 */
class Injections {
    /**
     * @param ctor Constructor function.
     */
    constructor(ctor, inst) {
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
    /**
     * Return dependencies list.
     * @returns The name of depends class, instance, provider array.
     */
    get injections() { return this.injectionList; }
    /**
     * Construct dependent name array.
     * @param ctor Constructor function.
     */
    initCtorInjections(ctor) {
        this.extractInjectionTarget(ctor, injectionTargetSymbol);
        this.extractInjectionTarget(ctor, dynamicTargetSymbol);
    }
    /**
     * Construct dependent name array.
     * @param ctor Constructor function.
     */
    initInstanceInjections(inst) {
        this.extractInjectionTarget(inst, injectionTargetSymbol);
        this.extractInjectionTarget(inst, dynamicTargetSymbol);
    }
    /**
     * Extract configs by symbol.
     * @param target Target object.
     * @param symbol Symbol object.
     */
    extractInjectionTarget(target, symbol) {
        var resources = target[symbol];
        if (!_.isArray(resources)) {
            if (!resources) {
                resources = [];
            }
            else {
                resources = [resources];
            }
        }
        this.injectionList = this.injectionList.concat(resources);
    }
}
/**
 * The main class.
 */
export class Injector {
    /**
     * @param modules The module array that is defined dependencies.
     */
    constructor(modules) {
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
    initialize(modules) {
        var obj = {};
        _.forEach(modules, (mod) => {
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
     * Instantiate eagerSingleton class.
     */
    instantiateEagerSingletons() {
        _.forIn(this.bindings, (v, k) => {
            if (v.eagerSingleton) {
                this.getInstanceFromSelf(k);
            }
        });
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
    inject(ctor, params) {
        var injections = new Injections(ctor);
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
    injectToInstance(inst, params) {
        if (inst[injectionTargetSymbol]) {
            let keyArgs = this.createArguments(new Injections(null, inst), params, true);
            return _.extend(inst, keyArgs);
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
    injectOnce(ctor, params) {
        if (!ctor[SINGLETON_KEY]) {
            ctor[SINGLETON_KEY] = this.inject(ctor, params);
        }
        return ctor[SINGLETON_KEY];
    }
    /**
     * Create child injector of passed injector.
     * @param modules The new module to add.
     */
    createChildInjector(modules) {
        const injector = new Injector(modules);
        injector.parent = this;
        return injector;
    }
    /**
     * Get instance from self and parents.
     * @param key The key of dependency.
     * @return The instance that created from found dependency.
     */
    get(key) {
        let instance = null;
        let injector = this;
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
    getInstanceFromSelf(key) {
        let ret;
        if (typeof key === 'string') {
            ret = _.filter(_.assign(this.bindings, this.templates), (binding, name) => name === key)[0];
            let instance = ret ? this.getInstance(key, null, ret, ret.template) : null;
            return instance;
        }
        else {
            ret = [];
            _.forIn(_.assign(this.bindings, this.templates), (binding, name) => {
                if (key.test(name)) {
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
    selfKeys() {
        return _.map(this.bindings, (binding, name) => name);
    }
    /**
     * @return all registerd dependent names.
     * @return List of dependent names.
     */
    keys() {
        let ret = [];
        this.findOnParent(bindings => {
            ret = ret.concat(_.map(bindings, (binding, name) => name));
            return true;
        });
        return ret;
    }
    /**
     * Create instance and resolve bindings.
     * @param ctor Constructor function.
     * @param injections Dependencies.
     * @returns The instance that dependencies injected.
     */
    doCreate(ctor, injections, params) {
        let args = this.createArguments(injections, params, false);
        let ret = this.invokeNewCall(ctor, args);
        if (ret[injectionTargetSymbol] || ret[dynamicTargetSymbol]) {
            let keyArgs = this.createArguments(new Injections(null, ret), params, true);
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
     * Instantiate class.
     * To fast instantiation, not use Function.prototype.apply but use switch case.
     * @param ctor Constructor function.
     * @param args Arguments.
     * @return The instance that dependencies injected.
     */
    invokeNewCall(ctor, args) {
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
                var dummy = () => { };
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
    createArguments(injections, params, useKeys) {
        const args = [];
        const keyArgs = {};
        const resources = injections.injections;
        const keys = params ? _.keys(params) : [];
        let bindingInfo;
        let bindingName;
        let dynamicName;
        let passProvider = false;
        let i = 0;
        let len;
        if (!resources) {
            return args;
        }
        for (i = 0, len = resources.length; i < len; i++) {
            var isDynamic = resources[i].length === 3;
            bindingName = resources[i][0];
            dynamicName = isDynamic ? resources[i][1] : null;
            if (_.isRegExp(bindingName)) {
                var inner = [];
                this.findOnParent((bindings, templates) => {
                    _.forEach(_.assign(bindings, templates), (binding, name) => {
                        bindingName.test(name) && inner.push(this.getInstance(name, null, binding, false));
                        _.forEach(keys, key => {
                            if (bindingName.test(key)) {
                                inner.push(this.getInstance(key, null, this.fromParams(params[key]), false));
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
                this.findOnParent((bindings, templates) => {
                    item = bindings[bindingName] || templates[bindingName] || (params ? this.fromParams(params[bindingName]) : null);
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
    }
    /**
     * Search include parents `Injector`.
     * Until passed callback return true, traverse parents.
     * @param cb Callback function.
     */
    findOnParent(cb) {
        var injector = this;
        while (injector) {
            var ret = cb(injector.bindings, injector.templates);
            if (!ret) {
                return;
            }
            injector = injector.parent;
        }
    }
    /**
     * Create binding from additional parameter.
     * @param val defined value in Binding.
     * @returns Binding definition.
     */
    fromParams(val) {
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
     * Create dependent instance.
     * @param bindingName Instance name.
     * @param item The defitnition of dependencies.
     * @returns The instance that is constructed.
     */
    getInstance(bindingName, dynamicName, item, isTemplate) {
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
            if (!_.isNil(provided)) {
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
    }
    /**
     * Hook interceptor.
     * @param Target instance.
     */
    applyInterceptor(inst) {
        if (inst[PROXIED_MARK]) {
            return;
        }
        _.every(this.intercepts, (i) => {
            if (inst[i.targetSymbol]) {
                if (_.isRegExp(inst[i.targetSymbol][0])) {
                    const regexp = inst[i.targetSymbol][0];
                    _.forIn(inst, (v, k) => {
                        if (regexp.test(k)) {
                            inst[k] = this.getMethodProxy(inst, v, this.getInterceptorInstance(i), k);
                        }
                    });
                    return false;
                }
                else {
                    _.forIn(inst[i.targetSymbol], (s) => {
                        if (inst[s]) {
                            if (typeof inst[s] !== 'function') {
                                throw new Error(`Interceptor only applyable to function.\nBut property ${s} is ${Object.prototype.toString.call(inst[s])}`);
                            }
                            inst[s] = this.getMethodProxy(inst, inst[s], this.getInterceptorInstance(i), s);
                        }
                    });
                }
                inst[PROXIED_MARK] = true;
            }
            return true;
        });
    }
    /**
     * Get interceptor instance.
     * @param i Interceptor class.
     * @returns INterceptor instance.
     */
    getInterceptorInstance(i) {
        if (!i.interceptor[SINGLETON_KEY]) {
            return this.inject(i.interceptor);
        }
        return i.interceptor[SINGLETON_KEY];
    }
    /**
     * Return wrapped method by interceptor.
     * @param context Execution context.
     * @param base Real method.
     * @param interceptor Instance of interceptor.
     * @param propertyKey Property name.
     * @returns Wrapped function.
     */
    getMethodProxy(context, base, interceptor, propertyKey) {
        return (...args) => {
            return interceptor.invoke(new MethodInvocation(base, context, args, context[INJECTION_NAME_SYMBOL], propertyKey));
        };
    }
}
