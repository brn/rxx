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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import * as React from 'react';
import { render } from 'react-dom';
import { Context, ContextReactTypes } from './component/context';
export function runner({ component, modules }) {
    class Renderer extends React.Component {
        constructor(p, c) {
            super(p, c);
            this.model = c.createProps(p);
        }
        render() {
            const C = component;
            return React.createElement(C, __assign({}, this.model));
        }
        componentDidMount() {
            this.context.connect(this.model);
        }
    }
    Renderer.contextTypes = ContextReactTypes;
    return (_a = class extends React.Component {
            render() {
                return (React.createElement(Context, {modules: modules}, 
                    React.createElement(Renderer, __assign({}, this.props))
                ));
            }
        },
        _a.displayName = 'MVIRoot',
        _a);
    var _a;
}
export function run(opt, el) {
    const Root = runner(opt);
    render(React.createElement(Root, null), el);
}
