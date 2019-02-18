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

const TYPE_MATCHER = /\[object ([^\]]+)\]/;
const TO_STRING = Object.prototype.toString;

/**
 * Convert object to query string.
 * @param data Data that need to convert to query string.
 * @param Query string.
 */
export function qs(data: any): string {
  const ret = [];
  serialize(data, ret);

  return ret.join('&');
}

/**
 * Get constructor type from any object.
 * @param value Object which want to inspect constructor type.
 */
function getType(value): string {
  return TO_STRING!.call(value).match(TYPE_MATCHER)![1];
}

/**
 * Push query string to resultCollection.
 * @param data Value that want to convert to query string.
 * @param resultCollection Serialized object store.
 * @param parentKey ParentObject key if current data is object.
 */
function serialize(
  data: any,
  resultCollection: string[],
  parentKey: string = '',
): void {
  const type = getType(data);
  if (type === 'Object') {
    for (const key in data) {
      const valueType = getType(data[key]);
      const keyValue = `${parentKey ? `${parentKey}.` : ''}${key}`;
      if (
        valueType === 'String' ||
        valueType === 'Number' ||
        valueType === 'RegExp' ||
        valueType === 'Boolean'
      ) {
        resultCollection.push(
          `${encodeURIComponent(keyValue)}=${encodeURIComponent(data[key])}`,
        );
      } else if (valueType === 'Date') {
        resultCollection.push(
          `${encodeURIComponent(keyValue)}=${encodeURIComponent(
            String(+data[key]),
          )}`,
        );
      } else if (valueType === 'Object') {
        serialize(data[key], resultCollection, key);
      } else if (valueType === 'Array') {
        serialize(data[key], resultCollection, key);
      }
    }
  } else if (type === 'Array') {
    for (let i = 0, len = data.length; i < len; i++) {
      resultCollection.push(
        `${encodeURIComponent(parentKey[i])}=${encodeURIComponent(data[i])}`,
      );
    }
  }
}
