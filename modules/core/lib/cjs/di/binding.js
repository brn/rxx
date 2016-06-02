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
/**
 * クラス型の追加設定
 */
var ClassTypeOption = (function () {
    function ClassTypeOption(binding) {
        this.binding = binding;
    }
    /**
     * シングルトンにする
     */
    ClassTypeOption.prototype.asSingleton = function () {
        this.binding.singleton = true;
    };
    /**
     * シングルトンにする
     */
    ClassTypeOption.prototype.asEagerSingleton = function () {
        this.binding.singleton = true;
        this.binding.eagerSingleton = true;
    };
    return ClassTypeOption;
}());
exports.ClassTypeOption = ClassTypeOption;
/**
 * バインディングと値をひもづける
 */
var BindingPlaceholder = (function () {
    /**
     * @param id 名前
     * @param holder バインディングのmap
     */
    function BindingPlaceholder(id, holder) {
        this.id = id;
        this.holder = holder;
    }
    BindingPlaceholder.prototype.to = function (ctor) {
        this.holder[this.id] = { val: ctor, singleton: false, eagerSingleton: false, instance: false, provider: false, template: false };
        return new ClassTypeOption(this.holder[this.id]);
    };
    /**
     * インスタンスとIdを紐つける
     * @param value 即値
     */
    BindingPlaceholder.prototype.toInstance = function (value) {
        this.holder[this.id] = { val: value, singleton: false, eagerSingleton: false, instance: true, provider: false, template: false };
    };
    /**
     * プロバイダとIdを紐つける
     * @param value プロバイダのコンストラクタ
     */
    BindingPlaceholder.prototype.toProvider = function (value) {
        this.holder[this.id] = { val: value, singleton: false, eagerSingleton: false, instance: false, provider: true, template: false };
    };
    return BindingPlaceholder;
}());
exports.BindingPlaceholder = BindingPlaceholder;
/**
 * インターセプタと値を保持するクラス
 */
var InterceptPlaceholder = (function () {
    /**
     * @param targetSymbol インターセプトするターゲットに設定されるsymbol
     */
    function InterceptPlaceholder(targetSymbol) {
        this.targetSymbol = targetSymbol;
    }
    /**
     * バインドを行う
     * @param methodProxyCtor MethodProxyのコンストラクタ
     */
    InterceptPlaceholder.prototype.to = function (methodProxyCtor) {
        this.interceptor = methodProxyCtor;
    };
    return InterceptPlaceholder;
}());
exports.InterceptPlaceholder = InterceptPlaceholder;
/**
 * テンプレート定義と値を保持するクラス
 */
var TemplatePlaceholder = (function () {
    /**
     * @param id templateのid
     * @param holder バインディングを保持するオブジェクト
     */
    function TemplatePlaceholder(id, holder) {
        this.id = id;
        this.holder = holder;
    }
    /**
     * 値を紐つける
     * @param ctor コンストラクタ
     */
    TemplatePlaceholder.prototype.to = function (ctor) {
        this.holder[this.id] = { val: ctor, singleton: false, eagerSingleton: false, instance: false, provider: false, template: true };
    };
    return TemplatePlaceholder;
}());
exports.TemplatePlaceholder = TemplatePlaceholder;
