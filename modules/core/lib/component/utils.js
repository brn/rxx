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
System.register(['./context', 'react'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var context_2, React;
    /**
     * statelessなCompositeComponentを作成する
     * @param render render関数か、各種lifecycleメソッドが定義されたオブジェクト
     */
    function component(render, componentName) {
        /**
         * render関数かどうかを判定する
         */
        function isRender(v) {
            return typeof v === 'function';
        }
        /**
         * 引数で渡された関数、オブジェクトから生成したCompositeComponent
         */
        var ret = (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                _super.apply(this, arguments);
            }
            class_1.prototype.render = function () {
                return isRender(render) ? render.call(this, this.props, this.context) : render.render.call(this, this.props, this.context);
            };
            class_1.prototype.componentWillMount = function () {
                if (!isRender(render) && render.componentWillMount) {
                    render.componentWillMount.call(this);
                }
            };
            class_1.prototype.componentDidMount = function () {
                if (!isRender(render) && render.componentDidMount) {
                    render.componentDidMount.call(this);
                }
            };
            class_1.prototype.componentDidUpdate = function () {
                if (!isRender(render) && render.componentDidUpdate) {
                    render.componentDidUpdate.call(this);
                }
            };
            class_1.prototype.componentWillUnmount = function () {
                if (!isRender(render) && render.componentWillUnmount) {
                    render.componentWillUnmount.call(this);
                }
            };
            class_1.prototype.shouldComponentUpdate = function (nextProps) {
                if (!isRender(render) && render.shouldComponentUpdate) {
                    return render.shouldComponentUpdate.call(this, nextProps);
                }
                return true;
            };
            class_1.contextTypes = context_2.ContextReactTypes;
            return class_1;
        }(React.Component));
        if (componentName) {
            ret['displayName'] = componentName;
        }
        return ret;
    }
    exports_1("component", component);
    return {
        setters:[
            function (context_2_1) {
                context_2 = context_2_1;
            },
            function (React_1) {
                React = React_1;
            }],
        execute: function() {
        }
    }
});
