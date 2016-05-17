// -*- mode: typescript -*-
/**
 * @fileoverview バインディングの定義
 * @author Taketoshi Aono
 */

import {
  ClassType
} from './classtype';
import {
  MethodInvocation,
  MethodProxy
} from './method-proxy';



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
export class ClassTypeOption {
  public constructor(private binding: Binding) {}

  /**
   * シングルトンにする
   */
  public asSingleton() {
    this.binding.singleton = true;
  }

  /**
   * シングルトンにする
   */
  public asEagerSingleton() {
    this.binding.singleton = true;
    this.binding.eagerSingleton = true;
  }
}


/**
 * バインディングと値をひもづける
 */
export class BindingPlaceholder {
  /**
   * @param id 名前
   * @param holder バインディングのmap
   */
  constructor(private id: string,
              private holder: BindingRelation) {}
  

  /**
   * クラスコンストラクタをIdと紐つける
   * @param ctor コンストラクタ関数
   * @returns 追加の設定クラス
   */
  public to<T>(ctor: any);
  public to<T>(ctor: ClassType<T>) {
    this.holder[this.id] = {val: ctor, singleton: false, eagerSingleton: false, instance: false, provider: false, template: false};
    return new ClassTypeOption(this.holder[this.id]);
  }

  
  /**
   * インスタンスとIdを紐つける
   * @param value 即値
   */
  public toInstance<T>(value: T) {
    this.holder[this.id] = {val: value, singleton: false, eagerSingleton: false, instance: true, provider: false, template: false};
  }


  /**
   * プロバイダとIdを紐つける
   * @param value プロバイダのコンストラクタ
   */
  public toProvider<T>(value: ClassType<Provider<T>>) {
    this.holder[this.id] = {val: value, singleton: false, eagerSingleton: false, instance: false, provider: true, template: false}
  }
}


/**
 * インターセプタと値を保持するクラス
 */
export class InterceptPlaceholder {
  /**
   * インターセプタ
   */
  private interceptor: new() => MethodProxy;

  /**
   * @param targetSymbol インターセプトするターゲットに設定されるsymbol
   */
  public constructor(private targetSymbol: symbol) {}

  /**
   * バインドを行う
   * @param methodProxyCtor MethodProxyのコンストラクタ
   */
  public to(methodProxyCtor: new() => MethodProxy) {
    this.interceptor = methodProxyCtor;
  }
}


/**
 * テンプレート定義と値を保持するクラス
 */
export class TemplatePlaceholder {
  /**
   * @param id templateのid
   * @param holder バインディングを保持するオブジェクト
   */
  constructor(private id: string,
              private holder: BindingRelation) {}


  /**
   * 値を紐つける
   * @param ctor コンストラクタ
   */
  public to<T>(ctor: ClassType<T>) {
    this.holder[this.id] = {val: ctor, singleton: false, eagerSingleton: false, instance: false, provider: false, template: true};
  }
}
