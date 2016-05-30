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
import { ClassType } from './classtype';
import { MethodProxy } from './method-proxy';
/**
 * バインディングの定義
 */
export interface Binding {
    /**
     * 設定された値
     */
    val: any;
    /**
     * シングルトンかどうか
     */
    singleton: boolean;
    /**
     * インスタンスを前もって作成するかどうか
     */
    eagerSingleton: boolean;
    /**
     * 即値かどうか
     */
    instance: boolean;
    /**
     * providerの設定
     */
    provider: boolean;
    /**
     * templateの設定
     */
    template: boolean;
}
/**
 * バインディング名から設定を引くための辞書
 */
export interface BindingRelation {
    [index: string]: Binding;
}
/**
 * プロバイダのインターフェース
 */
export interface Provider<T> {
    /**
     * インスタンスを作成する
     */
    provide(): T;
}
/**
 * クラス型の追加設定
 */
export declare class ClassTypeOption {
    private binding;
    constructor(binding: Binding);
    /**
     * シングルトンにする
     */
    asSingleton(): void;
    /**
     * シングルトンにする
     */
    asEagerSingleton(): void;
}
/**
 * バインディングと値をひもづける
 */
export declare class BindingPlaceholder {
    private id;
    private holder;
    /**
     * @param id 名前
     * @param holder バインディングのmap
     */
    constructor(id: string, holder: BindingRelation);
    /**
     * クラスコンストラクタをIdと紐つける
     * @param ctor コンストラクタ関数
     * @returns 追加の設定クラス
     */
    to<T>(ctor: any): any;
    /**
     * インスタンスとIdを紐つける
     * @param value 即値
     */
    toInstance<T>(value: T): void;
    /**
     * プロバイダとIdを紐つける
     * @param value プロバイダのコンストラクタ
     */
    toProvider<T>(value: ClassType<Provider<T>>): void;
}
/**
 * インターセプタと値を保持するクラス
 */
export declare class InterceptPlaceholder {
    private targetSymbol;
    /**
     * インターセプタ
     */
    private interceptor;
    /**
     * @param targetSymbol インターセプトするターゲットに設定されるsymbol
     */
    constructor(targetSymbol: symbol);
    /**
     * バインドを行う
     * @param methodProxyCtor MethodProxyのコンストラクタ
     */
    to(methodProxyCtor: new () => MethodProxy): void;
}
/**
 * テンプレート定義と値を保持するクラス
 */
export declare class TemplatePlaceholder {
    private id;
    private holder;
    /**
     * @param id templateのid
     * @param holder バインディングを保持するオブジェクト
     */
    constructor(id: string, holder: BindingRelation);
    /**
     * 値を紐つける
     * @param ctor コンストラクタ
     */
    to<T>(ctor: ClassType<T>): void;
}
