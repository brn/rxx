/**
 * 指定された正規表現にマッチした、全てのメソッドをインターセプトするためのデコレータ
 * @param key インターセプトするためのマーク
 * @param regexp メソッドを指定するための正規表現
 * @returns クラスデコレータ
 */
export declare function interceptAll(key: symbol, regexp: RegExp): <T extends Function>(target: T) => void;
/**
 * メソッドをインターセプトするためのデコレータ
 * @param key インターセプトするためのマーク
 * @returns メソッドデコレータ
 */
export declare function intercept(key: symbol): (target: Object, propertyKey: string | symbol) => void;
