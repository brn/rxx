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
 * モジュールのベース実装
 */
export declare abstract class AbstractModule implements Module {
    /**
     * バインディングのマップ
     */
    private bindings;
    /**
     * テンプレートのマッピング
     */
    private templates;
    /**
     * インターセプタのマッピング
     */
    private intercepts;
    /**
     * バインディングのIdを定義する
     * @param name バインディングのId
     * @returns 実体定義クラス
     */
    bind(name: string): BindingPlaceholder;
    /**
     * テンプレートのIDを定義する
     */
    template(name: string): TemplatePlaceholder;
    /**
     * インターセプトするシンボルを登録する
     * @param targetSymbol インターセプトするsymbol
     */
    bindInterceptor(targetSymbol: symbol): InterceptPlaceholder;
    /**
     * バインディングのマップを返す
     * @returns バインディング定義
     */
    getBindings(): BindingRelation;
    /**
     * テンプレートのマップを返す
     * @returns テンプレートのバインディング定義
     */
    getTemplates(): BindingRelation;
    /**
     * インターセプトするシンボルのリストを取得する
     * @returns インターセプタのバインディング定義
     */
    getIntercepts(): InterceptPlaceholder[];
    /**
     * 設定を行う
     * @override
     */
    abstract configure(): void;
    /**
     * 他のモジュールの設定を取り込む
     * @param m モジュール
     */
    mixin(m: AbstractModule): void;
}
export declare function createModule(fn: (config: AbstractModule) => void): Module;
