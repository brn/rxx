/**
 * DI config key.
 */
export declare const injectionTargetSymbol: symbol;
/**
 * Dynamic decorator key.
 */
export declare const dynamicTargetSymbol: symbol;
/**
 * DIしたいプロパティに設定するデコレータ
 * @param name プロパティ名とは違うモジュールを注入したい場合の名前
 * @returns メソッドデコレータ
 */
export declare function inject(name?: string): (target: Object, propertyKey: string | symbol) => void;
/**
 * DIしたいコンストラクタ引数に設定するデコレータ
 * @param name 注入したいモジュール名かモジュール名の正規表現
 * @returns パラメータデコレータ
 */
export declare function param(name: string | RegExp): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
