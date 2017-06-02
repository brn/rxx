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
 * DI config key.
 */
export declare const injectionTargetSymbol: symbol;
/**
 * Dynamic decorator key.
 */
export declare const dynamicTargetSymbol: symbol;
/**
 * DIしたいプロパティに設定するデコレータ
 * @param name プロパティ名とは違うモジュールを注入したい場合の名前
 * @returns メソッドデコレータ
 */
export declare function inject(name?: string): (target: Object, propertyKey: string | symbol) => void;
/**
 * DIしたいコンストラクタ引数に設定するデコレータ
 * @param name 注入したいモジュール名かモジュール名の正規表現
 * @returns パラメータデコレータ
 */
export declare function param(name: string | RegExp): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
