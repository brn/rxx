// -*- mode: typescript -*-
/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import * as binding from './binding';


/**
 * モジュールのインターフェース
 */
export interface Module {
  /**
   * Idに実体を紐つける
   */
  configure(): void;


  /**
   * テンプレート定義を取得する
   */
  getTemplates(): binding.BindingRelation;

  
  /**
   * バインディングのマップを取得する
   */
  getBindings(): binding.BindingRelation;


  /**
   * インターセプトするシンボルのリストを取得する
   */
  getIntercepts(): binding.InterceptPlaceholder[];
}
