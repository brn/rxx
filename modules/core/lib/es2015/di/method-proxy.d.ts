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
/**
 * Abstract expression for method invocation.
 */
export declare class MethodInvocation {
    private method;
    private context;
    private args;
    private contextName;
    private propertyKey;
    /**
     * @param method Function body.
     * @param context Calling context.
     * @param args Arguments.
     * @param contextName The name of execution context.
     * @param propertyKey Property name.
     */
    constructor(method: Function, context: any, args: any[], contextName: string, propertyKey: string);
    /**
     * Execute function.
     * @returns Execute result.
     */
    proceed(): any;
    /**
     * Get arguments.
     * @returns Arguments.
     */
    getArguments(): any[];
    /**
     * Get context.
     * @returns Execution context.
     */
    getContext(): any;
    /**
     * Get instance name.
     * @returns string A instance name.
     */
    getInstanceName(): string;
    /**
     * Get property name.
     * @returns string A property name.
     */
    getPropertyName(): string;
    /**
     * Return joined name of context and property.
     */
    getFullQualifiedName(): string;
}
/**
 * Interceptor interface.
 */
export interface MethodProxy {
    /**
     * Call interceptor.
     * @param methodInvocation Abstract expression of method invocation..
     */
    invoke(methodInvocation: MethodInvocation): any;
}
