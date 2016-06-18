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
import { BindingRelation, BindingPlaceholder, TemplatePlaceholder, InterceptPlaceholder } from './binding';
import { Module } from './module';
/**
 * Base implementation of `Module`.
 */
export declare abstract class AbstractModule implements Module {
    /**
     * Map of bindings.
     */
    private bindings;
    /**
     * Map of template.
     */
    private templates;
    /**
     * Map of interceptor.
     */
    private intercepts;
    /**
     * Define binding id.
     * @param name Binding id.
     * @returns Concrete class.
     */
    bind(name: string): BindingPlaceholder;
    /**
     * Define template id.
     * @param name Template binding id.
     */
    template(name: string): TemplatePlaceholder;
    /**
     * Register interceptor Symbol.
     * @param targetSymbol Symbol that set interceptor target.
     */
    bindInterceptor(targetSymbol: symbol): InterceptPlaceholder;
    /**
     * Return binding map.
     * @returns Binding definitions.
     */
    getBindings(): BindingRelation;
    /**
     * Return template map.
     * @returns Template definitions.
     */
    getTemplates(): BindingRelation;
    /**
     * Get list of symbol that interceptor target.
     * @returns Definition of binding of interceptor.
     */
    getIntercepts(): InterceptPlaceholder[];
    /**
     * Configure binding of modules.
     * @override
     */
    abstract configure(): void;
    /**
     * Mixin other module configs.
     * @param m Module.
     */
    mixin(m: AbstractModule): void;
}
/**
 * Simple utility function that create module.
 * @param fn The configure method body.
 * @returns Module implementation.
 */
export declare function createModule(fn: (config: AbstractModule) => void): Module;
