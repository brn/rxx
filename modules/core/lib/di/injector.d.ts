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
import { Module } from './module';
/**
 * di時に使用された名前を格納するキー
 */
export declare const INJECTION_NAME_SYMBOL: symbol;
/**
 * diを実行するメインクラス
 */
export declare class Injector {
    /**
     * 親の`Injector`
     */
    private parent;
    /**
     * バインディングの定義
     */
    private bindings;
    /**
     * インターセプタのバインディング定義
     */
    private intercepts;
    /**
     * テンプレートのバインディング定義
     */
    private templates;
    /**
     * テンプレート定義
     */
    private templateDefinitions;
    /**
     * @param modules 依存関係を定義したモジュールの配列
     */
    constructor(modules: Module[]);
    /**
     * 初期化処理を行う
     * @param modules バインディング定義が記述された`Module`
     */
    private initialize(modules);
    /**
     * eagerSingletonのインスタンスを作成しておく
     */
    private instantiateEagerSingletons();
    /**
     * 依存性を解決した上でインスタンスを生成する。
     *
     * @param ctor コンストラクタ関数
     * @param params 追加の依存性
     * @returns 依存性を注入したインスタンス
     * @example
     *
     * class Foo {...}
     *
     * class Bar {
     *   @inject()
     *   private foo
     *
     *   constructor() {}
     * }
     *
     * class TestModule extends AbstractModule {
     *   public configure() {
     *     this.bind('foo').to(Foo);
     *   }
     * }
     *
     * var injector = new Injector(new TestModule());
     *
     * //この呼出でBarクラスの引数fooにModuleで指定されている値が自動で注入される。
     * injector.inject<Bar>(Bar);
     */
    inject<T>(ctor: ClassType<T>, params?: any): T;
    /**
     * 生成されたインスタンスに依存性を注入する
     *
     * @param ctor コンストラクタ関数
     * @param params 追加の依存性
     * @returns 依存性を注入したインスタンス
     * @example
     *
     * class Foo {...}
     *
     * class Bar {
     *   @inject()
     *   private foo
     *
     *   constructor() {}
     * }
     *
     * class TestModule extends AbstractModule {
     *   public configure() {
     *     this.bind('foo').to(Foo);
     *   }
     * }
     *
     * var injector = new Injector(new TestModule());
     *
     * //この呼出でBarクラスの引数fooにModuleで指定されている値が自動で注入される。
     * injector.injectToInstance<Bar>(new Bar());
     */
    injectToInstance<T>(inst: T, params?: any): T;
    /**
     * 一度だけ依存性を解決する、二度目以降に同じコンストラクタ関数が渡された場合は、
     * 初回に生成したインスタンスを返す。
     * @param ctor コンストラクタ関数
     * @param params 追加の依存性
     */
    injectOnce<T>(ctor: ClassType<T>, params?: any): T;
    /**
     * 既存の`Injector`インスタンスから新たな`Injector`を生成する。
     * @param modules 新たに追加する`Module`
     */
    createChildInjector(modules: Module[]): Injector;
    get(key: string | RegExp): any;
    /**
     * 自分自身からバインディング定義を検索してインスタンスを生成する。
     * この際、親の`Injector`の定義は参照しない。
     * @param key 検索するバインディング定義
     * @returns 見つかった定義から生成したインスタンス
     */
    getInstanceFromSelf(key: string | RegExp): any;
    selfKeys(): string[];
    keys(): string[];
    /**
     * インスタンスの生成とbindingの解決を行う
     * @param ctor コンストラクタ関数
     * @param injections 依存性
     * @returns 依存性を注入したインスタンス
     */
    private doCreate<T>(ctor, injections, params);
    /**
     * インスタンス生成
     * 速度のために、Function.prototype.applyを使わずに引数の数で分岐する。
     * @param ctor コンストラクタ関数
     * @param args 引数
     * @return 依存性を注入したインスタンス
     */
    private invokeNewCall<T>(ctor, args);
    /**
     * 引数の自動生成を行う
     * @param injections 依存性
     * @returns 依存性の配列
     */
    private createArguments<T>(injections, params, useKeys?);
    /**
     * 親の`Injector`を含めて検索する
     * 引数で渡された関数がtrueを返す限り親をたどり続ける
     * @param cb コールバック関数
     */
    private findOnParent(cb);
    /**
     * `Injector#inject`等の引数で渡された追加の依存性から、バインディング定義を生成する
     * @param val バインディング定義の値
     * @returns バインディング定義
     */
    private fromParams(val);
    /**
     * 依存しているインスタンスの生成
     * @param bindingName インスタンス名
     * @param item バインディングの定義
     * @returns 構築済みインスタンス
     */
    private getInstance<T>(bindingName, dynamicName, item, isTemplate);
    /**
     * インターセプタをフックする
     * @param フックする対象インスタンス
     */
    private applyInterceptor<T>(inst);
    /**
     * インターセプタ自体のインスタンスを取得する
     * @param i インターセプタクラス
     * @returns インターセプタのインスタンス
     */
    private getInterceptorInstance(i);
    /**
     * インターセプタでラップしたメソッドを返す。
     * @param context 実行コンテキスト
     * @param base 実際のメソッド
     * @param interceptor インターセプタインスタンス
     * @param propertyKey プロパティ名
     * @returns ラップされた関数
     */
    private getMethodProxy(context, base, interceptor, propertyKey);
}
