/**
 * @fileoverview インターセプタのためのデコレータを定義する
 * @author Taketoshi Aono
 */


/// <reference path="../_references.d.ts" />

import * as _ from 'lodash';


/**
 * 指定されたキーで設定用の配列を初期化する
 * @param target 対象のオブジェクト
 * @param key キー
 */
function initList(target: any, key: symbol) {
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
export function interceptAll(key: symbol, regexp: RegExp) {
  return <T extends Function>(target: T) => {
    initList(target.prototype, key);
    target.prototype[key].push(regexp);
  }
}


/**
 * メソッドをインターセプトするためのデコレータ
 * @param key インターセプトするためのマーク
 * @returns メソッドデコレータ
 */
export function intercept(key: symbol) {
  return (target: Object, propertyKey: string | symbol): void => {
    if (target[key] && _.isRegExp(target[key][0])) {
      throw new Error('Cannot intercept already annotated with @interceptAll');
    }
    initList(target, key);
    target[key].push(propertyKey);
    return null;
  }
}
