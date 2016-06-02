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
import { _ } from '../shims/lodash';
/**
 * 指定されたキーで設定用の配列を初期化する
 * @param target 対象のオブジェクト
 * @param key キー
 */
function initList(target, key) {
    if (!target[key]) {
        target[key] = [];
    }
}
/**
 * 指定された正規表現にマッチした、全てのメソッドをインターセプトするためのデコレータ
 * @param key インターセプトするためのマーク
 * @param regexp メソッドを指定するための正規表現
 * @returns クラスデコレータ
 */
export function interceptAll(key, regexp) {
    return (target) => {
        initList(target.prototype, key);
        target.prototype[key].push(regexp);
    };
}
/**
 * メソッドをインターセプトするためのデコレータ
 * @param key インターセプトするためのマーク
 * @returns メソッドデコレータ
 */
export function intercept(key) {
    return (target, propertyKey) => {
        if (target[key] && _.isRegExp(target[key][0])) {
            throw new Error('Cannot intercept already annotated with @interceptAll');
        }
        initList(target, key);
        target[key].push(propertyKey);
        return null;
    };
}
