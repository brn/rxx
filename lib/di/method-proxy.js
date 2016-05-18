// -*- mode: typescript -*-
/**
 * @fileoverview インターセプタ内で使用されるメソッドの抽象クラス定義
 * @author Taketoshi Aono
 */
System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var MethodInvocation;
    return {
        setters:[],
        execute: function() {
            /**
             * メソッド呼び出しの抽象表現
             */
            MethodInvocation = (function () {
                /**
                 * @param method 関数本体
                 * @param context 呼び出しコンテキスト
                 * @param args 引数
                 * @param contextName 実行コンテキストの名前
                 * @param propertyKey 呼び出しプロパティ名
                 */
                function MethodInvocation(method, context, args, contextName, propertyKey) {
                    this.method = method;
                    this.context = context;
                    this.args = args;
                    this.contextName = contextName;
                    this.propertyKey = propertyKey;
                }
                /**
                 * 関数呼び出しを実行する
                 * @returns 実行結果
                 */
                MethodInvocation.prototype.proceed = function () {
                    return this.method.apply(this.context, this.args);
                };
                /**
                 * 引数を取得する
                 * @returns 引数リスト
                 */
                MethodInvocation.prototype.getArguments = function () {
                    return this.args;
                };
                /**
                 * 実行コンテキストを取得する
                 * @returns 実行コンテキスト
                 */
                MethodInvocation.prototype.getContext = function () {
                    return this.context;
                };
                /**
                 * インスタンス名を取得する
                 * @returns string
                 */
                MethodInvocation.prototype.getInstanceName = function () {
                    return this.contextName;
                };
                /**
                 * プロパティ名を取得する
                 * @returns string
                 */
                MethodInvocation.prototype.getPropertyName = function () {
                    return this.propertyKey;
                };
                /**
                 * コンテキスト名とプロパティ名を繋いだ名前を返す。
                 */
                MethodInvocation.prototype.getFullQualifiedName = function () {
                    return this.getInstanceName() + "." + this.getPropertyName();
                };
                return MethodInvocation;
            }());
            exports_1("MethodInvocation", MethodInvocation);
        }
    }
});
