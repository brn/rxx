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
    constructor(method, context, args, contextName, propertyKey) {
        this.method = method;
        this.context = context;
        this.args = args;
        this.contextName = contextName;
        this.propertyKey = propertyKey;
    }
    /**
     * 関数呼び出しを実行する
     * @returns 実行結果
     */
    proceed() {
        return this.method.apply(this.context, this.args);
    }
    /**
     * 引数を取得する
     * @returns 引数リスト
     */
    getArguments() {
        return this.args;
    }
    /**
     * 実行コンテキストを取得する
     * @returns 実行コンテキスト
     */
    getContext() {
        return this.context;
    }
    /**
     * インスタンス名を取得する
     * @returns string
     */
    getInstanceName() {
        return this.contextName;
    }
    /**
     * プロパティ名を取得する
     * @returns string
     */
    getPropertyName() {
        return this.propertyKey;
    }
    /**
     * コンテキスト名とプロパティ名を繋いだ名前を返す。
     */
    getFullQualifiedName() {
        return `${this.getInstanceName()}.${this.getPropertyName()}`;
    }
}
