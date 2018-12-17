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

import {
  Advice,
  AdviceFunction,
  AdviceDefinition,
  MethodInvocation,
  IntentCallback,
} from './advice';

/**
 * Combine advices and make these to one advice.
 * In combined advice, MethodInvocation#proceed call next advice,
 * but other values like args, context etc... is return original value.
 * @param advices Advice list.
 * @returns Combined advice.
 */
export function combineAdvice(...advices: AdviceDefinition[]) {
  /**
   * Call Advice or AdviceFunction.
   * @param advice Call target.
   * @param mi MethodInvocation object.
   */
  function callAdvice(
    advice: AdviceDefinition,
    mi: MethodInvocation,
    ih: IntentCallback,
  ) {
    return typeof advice !== 'function'
      ? advice.invoke!(mi, ih)
      : advice(mi, ih);
  }

  /**
   * Advice that call other advices.
   * @param mi MethodInvocation object.
   * @returns Last advice returned value.
   */
  return async (mi: MethodInvocation, ih: IntentCallback) => {
    const loop = async (
      next: AdviceDefinition | undefined,
      advices: AdviceDefinition[],
    ) => {
      if (next) {
        return await callAdvice(
          next,
          new MethodInvocation(
            async () => loop(advices.shift(), advices),
            mi.getContext(),
            mi.getArguments(),
            mi.getInstanceName(),
            mi.getPropertyName(),
          ),
          ih,
        );
      }

      return mi.proceed();
    };
    const clone = advices.slice();

    return await loop(clone.shift(), clone);
  };
}
