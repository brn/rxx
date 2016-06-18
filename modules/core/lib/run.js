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
System.register(['react', './shims/lodash', 'react-dom', './component/context'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var __assign = (this && this.__assign) || Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    var React, lodash_1, react_dom_1, context_2;
    function runnable(_a) {
        var component = _a.component, modules = _a.modules;
        var Renderer = (function (_super) {
            __extends(Renderer, _super);
            function Renderer(p, c) {
                _super.call(this, p, c);
                this.model = c.createProps(p);
            }
            Renderer.prototype.render = function () {
                var C = component;
                return React.createElement(C, __assign({}, lodash_1._.assign(this.model, this.props)));
            };
            Renderer.prototype.componentDidMount = function () {
                this.context.connect(this.model);
            };
            Renderer.contextTypes = context_2.ContextReactTypes;
            return Renderer;
        }(React.Component));
        return (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                _super.apply(this, arguments);
            }
            class_1.prototype.render = function () {
                return (React.createElement(context_2.Context, {modules: modules}, 
                    React.createElement(Renderer, __assign({}, this.props))
                ));
            };
            class_1.displayName = 'MVIRoot';
            return class_1;
        }(React.Component));
    }
    exports_1("runnable", runnable);
    function run(opt, el) {
        var Root = runnable(opt);
        react_dom_1.render(React.createElement(Root, null), el);
    }
    exports_1("run", run);
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (react_dom_1_1) {
                react_dom_1 = react_dom_1_1;
            },
            function (context_2_1) {
                context_2 = context_2_1;
            }],
        execute: function() {
        }
    }
});
