// -*- mode: typescript -*-
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
import {
  _
} from '../shims/lodash';


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
