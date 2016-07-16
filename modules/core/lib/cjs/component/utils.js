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
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var context_1 = require('./context');
var lodash_1 = require('./../shims/lodash');
/**
 * Create stateless CompositeComponent with context that type is `ContextReactType`.
 * @param render Render function or object that implements each lifecycle methods.
 */
function component(component, componentName, additionalContext) {
    if (additionalContext === void 0) { additionalContext = {}; }
    /**
     * Check whether render is React.Component or not.
     */
    function isComponent(maybeComponent) {
        return typeof maybeComponent === 'function' && typeof maybeComponent.prototype.render === 'function';
    }
    /**
     * Check whether render is function or not.
     */
    function isRender(v) {
        return typeof v === 'function';
    }
    var ret;
    if (isComponent(component)) {
        var Renderer = component;
        ret = (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                _super.apply(this, arguments);
            }
            class_1.contextTypes = lodash_1._.assign(context_1.ContextReactTypes, additionalContext);
            return class_1;
        }(Renderer));
        if (Renderer['name']) {
            ret['displayName'] = Renderer['name'];
        }
    }
    else {
        var renderer_1 = component;
        /**
         * React.Component that is created from passed function or object.
         */
        ret = (function (_super) {
            __extends(class_2, _super);
            function class_2() {
                _super.apply(this, arguments);
            }
            class_2.prototype.render = function () {
                return isRender(renderer_1) ? renderer_1.call(this, this.props, this.context) : renderer_1.render.call(this, this.props, this.context);
            };
            class_2.prototype.componentWillMount = function () {
                if (!isRender(renderer_1) && renderer_1.componentWillMount) {
                    renderer_1.componentWillMount.call(this);
                }
            };
            class_2.prototype.componentDidMount = function () {
                if (!isRender(renderer_1) && renderer_1.componentDidMount) {
                    renderer_1.componentDidMount.call(this);
                }
            };
            class_2.prototype.componentDidUpdate = function () {
                if (!isRender(renderer_1) && renderer_1.componentDidUpdate) {
                    renderer_1.componentDidUpdate.call(this);
                }
            };
            class_2.prototype.componentWillUnmount = function () {
                if (!isRender(renderer_1) && renderer_1.componentWillUnmount) {
                    renderer_1.componentWillUnmount.call(this);
                }
            };
            class_2.prototype.shouldComponentUpdate = function (nextProps) {
                if (!isRender(renderer_1) && renderer_1.shouldComponentUpdate) {
                    return renderer_1.shouldComponentUpdate.call(this, nextProps);
                }
                return true;
            };
            class_2.contextTypes = lodash_1._.assign(context_1.ContextReactTypes, additionalContext);
            return class_2;
        }(React.Component));
    }
    if (componentName) {
        ret['displayName'] = componentName;
    }
    return ret;
}
exports.component = component;
