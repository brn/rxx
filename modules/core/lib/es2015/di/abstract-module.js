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
import { BindingPlaceholder, TemplatePlaceholder, InterceptPlaceholder } from './binding';
import { _ } from '../shims/lodash';
/**
 * モジュールのベース実装
 */
export class AbstractModule {
    constructor() {
        /**
         * バインディングのマップ
         */
        this.bindings = {};
        /**
         * テンプレートのマッピング
         */
        this.templates = {};
        /**
         * インターセプタのマッピング
         */
        this.intercepts = [];
    }
    /**
     * バインディングのIdを定義する
     * @param name バインディングのId
     * @returns 実体定義クラス
     */
    bind(name) {
        return new BindingPlaceholder(name, this.bindings);
    }
    /**
     * テンプレートのIDを定義する
     */
    template(name) {
        return new TemplatePlaceholder(name, this.templates);
    }
    /**
     * インターセプトするシンボルを登録する
     * @param targetSymbol インターセプトするsymbol
     */
    bindInterceptor(targetSymbol) {
        const p = new InterceptPlaceholder(targetSymbol);
        this.intercepts.push(p);
        return p;
    }
    /**
     * バインディングのマップを返す
     * @returns バインディング定義
     */
    getBindings() {
        return this.bindings;
    }
    /**
     * テンプレートのマップを返す
     * @returns テンプレートのバインディング定義
     */
    getTemplates() {
        return this.templates;
    }
    /**
     * インターセプトするシンボルのリストを取得する
     * @returns インターセプタのバインディング定義
     */
    getIntercepts() {
        return this.intercepts;
    }
    /**
     * 他のモジュールの設定を取り込む
     * @param m モジュール
     */
    mixin(m) {
        m.configure();
        _.extend(this.bindings, m.getBindings());
    }
}
export function createModule(fn) {
    return new (class extends AbstractModule {
        configure() {
            fn(this);
        }
    }
    );
}
