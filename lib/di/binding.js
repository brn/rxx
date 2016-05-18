// -*- mode: typescript -*-
/**
 * @fileoverview バインディングの定義
 * @author Taketoshi Aono
 */
System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ClassTypeOption, BindingPlaceholder, InterceptPlaceholder, TemplatePlaceholder;
    return {
        setters:[],
        execute: function() {
            /**
             * クラス型の追加設定
             */
            ClassTypeOption = (function () {
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
            exports_1("ClassTypeOption", ClassTypeOption);
            /**
             * バインディングと値をひもづける
             */
            BindingPlaceholder = (function () {
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
            exports_1("BindingPlaceholder", BindingPlaceholder);
            /**
             * インターセプタと値を保持するクラス
             */
            InterceptPlaceholder = (function () {
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
            exports_1("InterceptPlaceholder", InterceptPlaceholder);
            /**
             * テンプレート定義と値を保持するクラス
             */
            TemplatePlaceholder = (function () {
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
            exports_1("TemplatePlaceholder", TemplatePlaceholder);
        }
    }
});
