"use strict";
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_dom_1 = require("react-dom");
var context_1 = require("./component/context");
var utils_1 = require("./utils");
function runnable(_a) {
    var component = _a.component, modules = _a.modules, injector = _a.injector;
    var Renderer = (function (_super) {
        __extends(Renderer, _super);
        function Renderer(p, c) {
            var _this = _super.call(this, p, c) || this;
            if (p.injector && p.modules) {
                throw new Error("runnable or run only allow either of one of 'injector' or 'modules'.");
            }
            _this.model = c.createProps(p);
            return _this;
        }
        Renderer.prototype.render = function () {
            var C = component;
            return React.createElement(C, __assign({}, utils_1.assign(this.model, this.props)));
        };
        Renderer.prototype.componentDidMount = function () {
            this.context.connect(this.model);
        };
        return Renderer;
    }(React.Component));
    Renderer.contextTypes = context_1.ContextReactTypes;
    return _b = (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.render = function () {
                return (React.createElement(context_1.Context, { modules: modules, injector: injector },
                    React.createElement(Renderer, __assign({}, this.props))));
            };
            return class_1;
        }(React.Component)),
        _b.displayName = 'MVIRoot',
        _b;
    var _b;
}
exports.runnable = runnable;
/**
 * Start react-mvi components
 * @param opt Components and Modules.
 */
function run(opt, el) {
    var Root = runnable(opt);
    react_dom_1.render(React.createElement(Root, null), el);
}
exports.run = run;
