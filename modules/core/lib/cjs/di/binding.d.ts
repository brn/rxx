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
import { MethodProxy } from './method-proxy';
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
export declare class ClassTypeOption {
    private binding;
    constructor(binding: Binding);
    /**
     * Make class singleton.
     */
    asSingleton(): void;
    /**
     * Make class eager singleton.
     */
    asEagerSingleton(): void;
}
/**
 * Link binding to value.
 */
export declare class BindingPlaceholder {
    private id;
    private holder;
    /**
     * @param id Binding id.
     * @param holder Bindings map.
     */
    constructor(id: string, holder: BindingRelation);
    /**
     * Link constructor function to binding id.
     * @param ctor Constructor function.
     * @returns Option.
     */
    to<T>(ctor: any): ClassTypeOption;
    /**
     * Link instance to binding id.
     * @param value Immediate value.
     */
    toInstance<T>(value: T): void;
    /**
     * Link Provider to binding id.
     * @param value Provider constructor function.
     */
    toProvider<T>(value: ClassType<Provider<T>>): ClassTypeOption;
}
/**
 * Hold interceptor and value.
 */
export declare class InterceptPlaceholder {
    private targetSymbol;
    /**
     * Interceptor function.
     */
    private interceptor;
    /**
     * Singleton flag.
     */
    private singleton;
    /**
     * Eager singleton flag.
     */
    private eagerSingleton;
    private id;
    /**
     * @param targetSymbol The symbol that set to intercepted.
     */
    constructor(targetSymbol: symbol);
    /**
     * Do binding.
     * @param methodProxyCtor MethodProxy constructor funciton.
     */
    to(methodProxyCtor: new () => MethodProxy): ClassTypeOption;
}
/**
 * Hold template definitions and values.
 */
export declare class TemplatePlaceholder {
    private id;
    private holder;
    /**
     * @param id Template id.
     * @param holder Object that hold bindings.
     */
    constructor(id: string, holder: BindingRelation);
    /**
     * Link template to binding id.
     * @param ctor Constructor function.
     */
    to<T>(ctor: ClassType<T>): void;
}
