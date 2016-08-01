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
import { ClassType } from './classtype';
import { Binding } from './binding';
import { Module } from './module';
/**
 * The key to hold dependency name.
 */
export declare const INJECTION_NAME_SYMBOL: symbol;
/**
 * The main class.
 */
export declare class Injector {
    /**
     * Parent `Injector`.
     */
    private parent;
    /**
     * Definition of bindings.
     */
    private bindings;
    /**
     * Definition of interceptor bindings.
     */
    private intercepts;
    /**
     * Definition of template bindings.
     */
    private templates;
    /**
     * Definition of template.
     */
    private templateDefinitions;
    /**
     * @param modules The module array that is defined dependencies.
     */
    constructor(modules: Module[]);
    /**
     * Iniaitlize modules and injector.
     * @param modules The `Module` that are defined dependency relations.
     */
    private initialize(modules);
    /**
     * Instantiate eagerSingleton class.
     */
    private instantiateEagerSingletons();
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
    inject<T>(ctor: ClassType<T>, params?: any): T;
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
    injectToInstance<T>(inst: T, params?: any): T;
    /**
     * Resolve dependencies at once.
     * If passed same constructor function twice,
     * return first time instantiated instance.
     * @param ctor Constructor function.
     * @param params Additional dependencies.
     */
    injectOnce<T>(ctor: ClassType<T>, params?: any): T;
    /**
     * Create child injector.
     * Child injector is binded parent modules and self modules.
     * @param modules The new module to add.
     */
    createChildInjector(modules: Module[]): Injector;
    /**
     * Get instance from self and parents.
     * @param key The key of dependency.
     * @return The instance that created from found dependency.
     */
    get(key: string | RegExp): any;
    /**
     * Get instance from self, not includes parents.
     * @param key The key of dependency.
     * @returns The instance that created from found dependency.
     */
    getInstanceFromSelf(key: string | RegExp): any;
    /**
     * Return all registered dependent names of self, not includes parents.
     * @returns List of dependent names.
     */
    selfKeys(): string[];
    /**
     * @return all registerd dependent names.
     * @return List of dependent names.
     */
    keys(): string[];
    /**
     * Find bindings.
     * @param predicate Predicate callback.
     */
    find(predicate: (binding: Binding, key: string) => boolean): {
        [key: string]: Binding;
    };
    /**
     * Find bindings.
     * @param predicate Predicate callback.
     */
    findFromSelf(predicate: (binding: Binding, key: string) => boolean): {
        [key: string]: Binding;
    };
    /**
     * Create instance and resolve bindings.
     * @param ctor Constructor function.
     * @param injections Dependencies.
     * @returns The instance that dependencies injected.
     */
    private doCreate<T>(ctor, injections, params);
    /**
     * Instantiate class.
     * To fast instantiation, not use Function.prototype.apply but use switch case.
     * @param ctor Constructor function.
     * @param args Arguments.
     * @return The instance that dependencies injected.
     */
    private invokeNewCall<T>(ctor, args);
    /**
     * Create arguments from bindings.
     * @param injections Dependencies.
     * @returns Array of dependencies.
     */
    private createArguments<T>(injections, params, useKeys?);
    /**
     * Search include parents `Injector`.
     * Until passed callback return true, traverse parents.
     * @param cb Callback function.
     */
    private findOnParent(cb);
    /**
     * Create binding from additional parameter.
     * @param val defined value in Binding.
     * @returns Binding definition.
     */
    private fromParams(val);
    /**
     * Create dependent instance.
     * @param bindingName Instance name.
     * @param item The defitnition of dependencies.
     * @returns The instance that is constructed.
     */
    private getInstance<T>(bindingName, dynamicName, item, isTemplate);
    /**
     * Hook interceptor.
     * @param Target instance.
     */
    private applyInterceptor<T>(inst);
    /**
     * Get interceptor instance.
     * @param i Interceptor class.
     * @returns INterceptor instance.
     */
    private getInterceptorInstance(i);
    /**
     * Return wrapped method by interceptor.
     * @param context Execution context.
     * @param base Real method.
     * @param interceptor Instance of interceptor.
     * @param propertyKey Property name.
     * @returns Wrapped function.
     */
    private getMethodProxy(context, base, interceptor, propertyKey);
}
