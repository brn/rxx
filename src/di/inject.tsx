// -*- mode: typescript -*-
/**
 * @fileoverview DIを制御するデコレータの定義
 * @author Taketoshi Aono
 */

import Symbol from 'es6-symbol';


/**
 * DIの設定キー
 */
export const injectionTargetSymbol = Symbol('__injections__');

/**
 * dynamicデコレータのキー
 */
export const dynamicTargetSymbol   = Symbol('__dynamic_injections__');


/**
 * diの設定を保持する配列を初期化する
 * @param target 対象のオブジェクト
 * @param symbol 配列のキー
 */
function addInjection(target: Object, symbol: symbol) {
  if (!target[symbol]) {
    target[symbol] = [];
  }
}


/**
 * DIしたいプロパティに設定するデコレータ
 * @param name プロパティ名とは違うモジュールを注入したい場合の名前
 * @returns メソッドデコレータ
 */
export function inject(name?: string) {
  return (target: Object, propertyKey: string | symbol): void => {
    addInjection(target, injectionTargetSymbol);
    if (name) {
      target[injectionTargetSymbol].push([name, propertyKey]);
    } else {
      target[injectionTargetSymbol].push([propertyKey, propertyKey]);
    }
  }
}


/**
 * DIしたいコンストラクタ引数に設定するデコレータ
 * @param name 注入したいモジュール名かモジュール名の正規表現
 * @returns パラメータデコレータ
 */
export function param(name: string|RegExp) {
  return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
    addInjection(target, injectionTargetSymbol);
    target[injectionTargetSymbol][parameterIndex] = [name, name];
  }
}
