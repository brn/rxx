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
import { ContextReactTypes } from './context';
import * as React from 'react';
/**
 * statelessなCompositeComponentを作成する
 * @param render render関数か、各種lifecycleメソッドが定義されたオブジェクト
 */
export function component(render, componentName) {
    /**
     * render関数かどうかを判定する
     */
    function isRender(v) {
        return typeof v === 'function';
    }
    /**
     * 引数で渡された関数、オブジェクトから生成したCompositeComponent
     */
    const ret = (_a = class extends React.Component {
            render() {
                return isRender(render) ? render.call(this, this.props, this.context) : render.render.call(this, this.props, this.context);
            }
            componentWillMount() {
                if (!isRender(render) && render.componentWillMount) {
                    render.componentWillMount.call(this);
                }
            }
            componentDidMount() {
                if (!isRender(render) && render.componentDidMount) {
                    render.componentDidMount.call(this);
                }
            }
            componentDidUpdate() {
                if (!isRender(render) && render.componentDidUpdate) {
                    render.componentDidUpdate.call(this);
                }
            }
            componentWillUnmount() {
                if (!isRender(render) && render.componentWillUnmount) {
                    render.componentWillUnmount.call(this);
                }
            }
            shouldComponentUpdate(nextProps) {
                if (!isRender(render) && render.shouldComponentUpdate) {
                    return render.shouldComponentUpdate.call(this, nextProps);
                }
                return true;
            }
        },
        _a.contextTypes = ContextReactTypes,
        _a);
    if (componentName) {
        ret['displayName'] = componentName;
    }
    return ret;
    var _a;
}
