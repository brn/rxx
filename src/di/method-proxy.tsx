// -*- mode: typescript -*-
/**
 * @fileoverview インターセプタ内で使用されるメソッドの抽象クラス定義
 * @author Taketoshi Aono
 */


/**
 * メソッド呼び出しの抽象表現
 */
export class MethodInvocation {
  /**
   * @param method 関数本体
   * @param context 呼び出しコンテキスト
   * @param args 引数
   * @param contextName 実行コンテキストの名前
   * @param propertyKey 呼び出しプロパティ名
   */
  public constructor(private method: Function,
                     private context: any,
                     private args: any[],
                     private contextName: string,
                     private propertyKey: string) {}


  /**
   * 関数呼び出しを実行する
   * @returns 実行結果
   */
  public proceed(): any {
    return this.method.apply(this.context, this.args);
  }


  /**
   * 引数を取得する
   * @returns 引数リスト
   */
  public getArguments(): any[] {
    return this.args;
  }


  /**
   * 実行コンテキストを取得する
   * @returns 実行コンテキスト
   */
  public getContext(): any {
    return this.context;
  }


  /**
   * インスタンス名を取得する
   * @returns string
   */
  public getInstanceName() :string {
    return this.contextName;
  }


  /**
   * プロパティ名を取得する
   * @returns string
   */
  public getPropertyName(): string {
    return this.propertyKey;
  }


  /**
   * コンテキスト名とプロパティ名を繋いだ名前を返す。
   */
  public getFullQualifiedName(): string {
    return `${this.getInstanceName()}.${this.getPropertyName()}`;
  }
}


/**
 * インターセプタのインターフェース
 */
export interface MethodProxy {
  /**
   * インターセプタを呼び出す。
   * @param methodInvocation インターセプトしたメソッドの抽象表現
   */
  invoke(methodInvocation: MethodInvocation): any;
}
