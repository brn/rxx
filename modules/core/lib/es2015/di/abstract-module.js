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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BindingPlaceholder, TemplatePlaceholder, InterceptPlaceholder } from './binding';
import { _ } from '../shims/lodash';
/**
 * Base implementation of `Module`.
 */
var AbstractModule = (function () {
    function AbstractModule() {
        /**
         * Map of bindings.
         */
        this.bindings = {};
        /**
         * Map of template.
         */
        this.templates = {};
        /**
         * Map of interceptor.
         */
        this.intercepts = [];
    }
    /**
     * Define binding id.
     * @param name Binding id.
     * @returns Concrete class.
     */
    AbstractModule.prototype.bind = function (name) {
        return new BindingPlaceholder(name, this.bindings);
    };
    /**
     * Define template id.
     * @param name Template binding id.
     */
    AbstractModule.prototype.template = function (name) {
        return new TemplatePlaceholder(name, this.templates);
    };
    /**
     * Register interceptor Symbol.
     * @param targetSymbol Symbol that set interceptor target.
     */
    AbstractModule.prototype.bindInterceptor = function (targetSymbol) {
        var p = new InterceptPlaceholder(targetSymbol);
        this.intercepts.push(p);
        return p;
    };
    /**
     * Return binding map.
     * @returns Binding definitions.
     */
    AbstractModule.prototype.getBindings = function () {
        return this.bindings;
    };
    /**
     * Return template map.
     * @returns Template definitions.
     */
    AbstractModule.prototype.getTemplates = function () {
        return this.templates;
    };
    /**
     * Get list of symbol that interceptor target.
     * @returns Definition of binding of interceptor.
     */
    AbstractModule.prototype.getIntercepts = function () {
        return this.intercepts;
    };
    /**
     * Mixin other module configs.
     * @param m Module.
     */
    AbstractModule.prototype.mixin = function (m) {
        m.configure();
        _.extend(this.bindings, m.getBindings());
    };
    return AbstractModule;
}());
AbstractModule = AbstractModule;
/**
 * Simple utility function that create module.
 * @param fn The configure method body.
 * @returns Module implementation.
 */
export function createModule(fn) {
    return new ((function (_super) {
        __extends(class_1, _super);
        function class_1() {
            _super.apply(this, arguments);
        }
        class_1.prototype.configure = function () {
            fn(this);
        };
        return class_1;
    }(AbstractModule)));
}
