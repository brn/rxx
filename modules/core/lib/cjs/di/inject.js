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
var symbol_1 = require('../shims/symbol');
/**
 * DI config key.
 */
exports.injectionTargetSymbol = symbol_1.Symbol('__injections__');
/**
 * Dynamic decorator key.
 */
exports.dynamicTargetSymbol = symbol_1.Symbol('__dynamic_injections__');
/**
 * diの設定を保持する配列を初期化する
 * @param target 対象のオブジェクト
 * @param symbol 配列のキー
 */
function addInjection(target, symbol) {
    if (!target[symbol]) {
        target[symbol] = [];
    }
}
/**
 * DIしたいプロパティに設定するデコレータ
 * @param name プロパティ名とは違うモジュールを注入したい場合の名前
 * @returns メソッドデコレータ
 */
function inject(name) {
    return function (target, propertyKey) {
        addInjection(target, exports.injectionTargetSymbol);
        if (name) {
            target[exports.injectionTargetSymbol].push([name, propertyKey]);
        }
        else {
            target[exports.injectionTargetSymbol].push([propertyKey, propertyKey]);
        }
    };
}
exports.inject = inject;
/**
 * DIしたいコンストラクタ引数に設定するデコレータ
 * @param name 注入したいモジュール名かモジュール名の正規表現
 * @returns パラメータデコレータ
 */
function param(name) {
    return function (target, propertyKey, parameterIndex) {
        addInjection(target, exports.injectionTargetSymbol);
        target[exports.injectionTargetSymbol][parameterIndex] = [name, name];
    };
}
exports.param = param;
