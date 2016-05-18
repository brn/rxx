// -*- mode: typescript -*-
/**
 * @fileoverview DIを制御するデコレータの定義
 * @author Taketoshi Aono
 */
System.register(['es6-symbol'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var es6_symbol_1;
    var injectionTargetSymbol, dynamicTargetSymbol;
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
            addInjection(target, injectionTargetSymbol);
            if (name) {
                target[injectionTargetSymbol].push([name, propertyKey]);
            }
            else {
                target[injectionTargetSymbol].push([propertyKey, propertyKey]);
            }
        };
    }
    exports_1("inject", inject);
    /**
     * DIしたいコンストラクタ引数に設定するデコレータ
     * @param name 注入したいモジュール名かモジュール名の正規表現
     * @returns パラメータデコレータ
     */
    function param(name) {
        return function (target, propertyKey, parameterIndex) {
            addInjection(target, injectionTargetSymbol);
            target[injectionTargetSymbol][parameterIndex] = [name, name];
        };
    }
    exports_1("param", param);
    return {
        setters:[
            function (es6_symbol_1_1) {
                es6_symbol_1 = es6_symbol_1_1;
            }],
        execute: function() {
            /**
             * DIの設定キー
             */
            exports_1("injectionTargetSymbol", injectionTargetSymbol = es6_symbol_1.default('__injections__'));
            /**
             * dynamicデコレータのキー
             */
            exports_1("dynamicTargetSymbol", dynamicTargetSymbol = es6_symbol_1.default('__dynamic_injections__'));
        }
    }
});
