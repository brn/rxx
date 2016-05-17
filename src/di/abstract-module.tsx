// -*- mode: typescript -*-
/**
 * @fileoverview ベースモジュールの定義
 * @author Taketoshi Aono
 */

import * as _ from 'lodash';
import {
  Binding,
  BindingRelation,
  BindingPlaceholder,
  TemplatePlaceholder,
  InterceptPlaceholder
} from './binding';
import {
  Module
} from './module';


/**
 * モジュールのベース実装
 */
export abstract class AbstractModule implements Module {
  /**
   * バインディングのマップ
   */
  private bindings: BindingRelation = {};

  /**
   * テンプレートのマッピング
   */
  private templates: BindingRelation = {};

  /**
   * インターセプタのマッピング
   */
  private intercepts: InterceptPlaceholder[] = [];


  /**
   * バインディングのIdを定義する
   * @param name バインディングのId
   * @returns 実体定義クラス
   */
  public bind(name: string): BindingPlaceholder {
    return new BindingPlaceholder(name, this.bindings);
  }


  /**
   * テンプレートのIDを定義する
   */
  public template(name: string): TemplatePlaceholder {
    return new TemplatePlaceholder(name, this.templates);
  }


  /**
   * インターセプトするシンボルを登録する
   * @param targetSymbol インターセプトするsymbol
   */
  public bindInterceptor(targetSymbol: symbol) {
    const p = new InterceptPlaceholder(targetSymbol);
    this.intercepts.push(p);
    return p;
  }


  /**
   * バインディングのマップを返す
   * @returns バインディング定義
   */
  public getBindings(): BindingRelation {
    return this.bindings;
  }


  /**
   * テンプレートのマップを返す
   * @returns テンプレートのバインディング定義
   */
  public getTemplates(): BindingRelation {
    return this.templates;
  }


  /**
   * インターセプトするシンボルのリストを取得する
   * @returns インターセプタのバインディング定義
   */
  public getIntercepts(): InterceptPlaceholder[] {
    return this.intercepts;
  }


  /**
   * 設定を行う
   * @override
   */
  public abstract configure(): void


  /**
   * 他のモジュールの設定を取り込む
   * @param m モジュール
   */
  public mixin(m: AbstractModule): void {
    m.configure();
    _.extend(this.bindings, m.getBindings());
  }
}


export function createModule(fn: (config: AbstractModule) => void): Module {
  return new (class extends AbstractModule {
    configure() {
      fn(this);
    }
  });
}
