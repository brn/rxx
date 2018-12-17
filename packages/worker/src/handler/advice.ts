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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */

export type IntentCallback = (type: string, payload?: any) => any;

/**
 * Abstract expression for method invocation.
 */
export class MethodInvocation {
  /**
   * @param method Function body.
   * @param context Calling context.
   * @param args Arguments.
   * @param contextName The name of execution context.
   * @param propertyKey Property name.
   */
  public constructor(
    private method: Function,
    private context: any,
    private args: any[],
    private contextName: string,
    private propertyKey: string,
  ) {}

  /**
   * Execute function.
   * @returns Execute result.
   */
  public proceed(): any {
    return this.method.apply(this.context, this.args);
  }

  /**
   * Get arguments.
   * @returns Arguments.
   */
  public getArguments(): any[] {
    return this.args;
  }

  /**
   * Get context.
   * @returns Execution context.
   */
  public getContext(): any {
    return this.context;
  }

  /**
   * Get instance name.
   * @returns string A instance name.
   */
  public getInstanceName(): string {
    return this.contextName;
  }

  /**
   * Get property name.
   * @returns string A property name.
   */
  public getPropertyName(): string {
    return this.propertyKey;
  }

  /**
   * Return joined name of context and property.
   */
  public getFullQualifiedName(): string {
    return `${this.getInstanceName()}.${this.getPropertyName()}`;
  }
}

export interface Advice {
  /**
   * Call advice.
   * @param methodInvocation Abstract expression of method invocation.
   */
  invoke?(methodInvocation: MethodInvocation, intent: IntentCallback): any;
}

/**
 * Call advice.
 * @param methodInvocation Abstract expression of method invocation.
 */
export type AdviceFunction = (
  methodInvocation: MethodInvocation,
  intent: IntentCallback,
) => any;

export type AdviceDefinition = Advice | AdviceFunction;
