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
"use strict";
/**
 * Abstract expression for method invocation.
 */
var MethodInvocation = (function () {
    /**
     * @param method Function body.
     * @param context Calling context.
     * @param args Arguments.
     * @param contextName The name of execution context.
     * @param propertyKey Property name.
     */
    function MethodInvocation(method, context, args, contextName, propertyKey) {
        this.method = method;
        this.context = context;
        this.args = args;
        this.contextName = contextName;
        this.propertyKey = propertyKey;
    }
    /**
     * Execute function.
     * @returns Execute result.
     */
    MethodInvocation.prototype.proceed = function () {
        return this.method.apply(this.context, this.args);
    };
    /**
     * Get arguments.
     * @returns Arguments.
     */
    MethodInvocation.prototype.getArguments = function () {
        return this.args;
    };
    /**
     * Get context.
     * @returns Execution context.
     */
    MethodInvocation.prototype.getContext = function () {
        return this.context;
    };
    /**
     * Get instance name.
     * @returns string A instance name.
     */
    MethodInvocation.prototype.getInstanceName = function () {
        return this.contextName;
    };
    /**
     * Get property name.
     * @returns string A property name.
     */
    MethodInvocation.prototype.getPropertyName = function () {
        return this.propertyKey;
    };
    /**
     * Return joined name of context and property.
     */
    MethodInvocation.prototype.getFullQualifiedName = function () {
        return this.getInstanceName() + "." + this.getPropertyName();
    };
    return MethodInvocation;
}());
exports.MethodInvocation = MethodInvocation;
