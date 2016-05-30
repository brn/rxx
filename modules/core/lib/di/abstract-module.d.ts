import { BindingRelation, BindingPlaceholder, TemplatePlaceholder, InterceptPlaceholder } from './binding';
import { Module } from './module';
/**
 * モジュールのベース実装
 */
export declare abstract class AbstractModule implements Module {
    /**
     * バインディングのマップ
     */
    private bindings;
    /**
     * テンプレートのマッピング
     */
    private templates;
    /**
     * インターセプタのマッピング
     */
    private intercepts;
    /**
     * バインディングのIdを定義する
     * @param name バインディングのId
     * @returns 実体定義クラス
     */
    bind(name: string): BindingPlaceholder;
    /**
     * テンプレートのIDを定義する
     */
    template(name: string): TemplatePlaceholder;
    /**
     * インターセプトするシンボルを登録する
     * @param targetSymbol インターセプトするsymbol
     */
    bindInterceptor(targetSymbol: symbol): InterceptPlaceholder;
    /**
     * バインディングのマップを返す
     * @returns バインディング定義
     */
    getBindings(): BindingRelation;
    /**
     * テンプレートのマップを返す
     * @returns テンプレートのバインディング定義
     */
    getTemplates(): BindingRelation;
    /**
     * インターセプトするシンボルのリストを取得する
     * @returns インターセプタのバインディング定義
     */
    getIntercepts(): InterceptPlaceholder[];
    /**
     * 設定を行う
     * @override
     */
    abstract configure(): void;
    /**
     * 他のモジュールの設定を取り込む
     * @param m モジュール
     */
    mixin(m: AbstractModule): void;
}
export declare function createModule(fn: (config: AbstractModule) => void): Module;
