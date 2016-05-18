/**
 * @fileoverview インターセプタのためのデコレータを定義する
 * @author Taketoshi Aono
 */
System.register(['lodash'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var _;
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
    function interceptAll(key, regexp) {
        return function (target) {
            initList(target.prototype, key);
            target.prototype[key].push(regexp);
        };
    }
    exports_1("interceptAll", interceptAll);
    /**
     * メソッドをインターセプトするためのデコレータ
     * @param key インターセプトするためのマーク
     * @returns メソッドデコレータ
     */
    function intercept(key) {
        return function (target, propertyKey) {
            if (target[key] && _.isRegExp(target[key][0])) {
                throw new Error('Cannot intercept already annotated with @interceptAll');
            }
            initList(target, key);
            target[key].push(propertyKey);
            return null;
        };
    }
    exports_1("intercept", intercept);
    return {
        setters:[
            function (_1) {
                _ = _1;
            }],
        execute: function() {
        }
    }
});
