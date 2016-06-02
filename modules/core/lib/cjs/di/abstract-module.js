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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var binding_1 = require('./binding');
var lodash_1 = require('../shims/lodash');
/**
 * モジュールのベース実装
 */
var AbstractModule = (function () {
    function AbstractModule() {
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
    AbstractModule.prototype.bind = function (name) {
        return new binding_1.BindingPlaceholder(name, this.bindings);
    };
    /**
     * テンプレートのIDを定義する
     */
    AbstractModule.prototype.template = function (name) {
        return new binding_1.TemplatePlaceholder(name, this.templates);
    };
    /**
     * インターセプトするシンボルを登録する
     * @param targetSymbol インターセプトするsymbol
     */
    AbstractModule.prototype.bindInterceptor = function (targetSymbol) {
        var p = new binding_1.InterceptPlaceholder(targetSymbol);
        this.intercepts.push(p);
        return p;
    };
    /**
     * バインディングのマップを返す
     * @returns バインディング定義
     */
    AbstractModule.prototype.getBindings = function () {
        return this.bindings;
    };
    /**
     * テンプレートのマップを返す
     * @returns テンプレートのバインディング定義
     */
    AbstractModule.prototype.getTemplates = function () {
        return this.templates;
    };
    /**
     * インターセプトするシンボルのリストを取得する
     * @returns インターセプタのバインディング定義
     */
    AbstractModule.prototype.getIntercepts = function () {
        return this.intercepts;
    };
    /**
     * 他のモジュールの設定を取り込む
     * @param m モジュール
     */
    AbstractModule.prototype.mixin = function (m) {
        m.configure();
        lodash_1._.extend(this.bindings, m.getBindings());
    };
    return AbstractModule;
}());
exports.AbstractModule = AbstractModule;
function createModule(fn) {
    return new ((function (_super) {
        __extends(class_1, _super);
        function class_1() {
            _super.apply(this, arguments);
        }
        class_1.prototype.configure = function () {
            fn(this);
        };
        return class_1;
    }(AbstractModule)));
}
exports.createModule = createModule;
