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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import * as React from 'react';
import { Subscriber, SUBSCRIBER_MARK } from './subscriber';
import { _ } from '../shims/lodash';
/**
 * Convert string html tag to Subscriber.
 */
var toSubscribable = function (name) {
    var ret = (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            _super.apply(this, arguments);
        }
        class_1.prototype.render = function () {
            return (React.createElement(Subscriber, null, React.createElement(name, _.assign(_.omit(this.props, 'ref'), { ref: 'element' }))));
        };
        class_1.displayName = "" + name.charAt(0).toUpperCase() + name.slice(1);
        return class_1;
    }(React.Component));
    ret[SUBSCRIBER_MARK] = true;
    return ret;
};
export var Tags = {};
"a abbr address area article aside audio b base bdi bdo big blockquote body br\nbutton canvas caption cite code col colgroup data datalist dd del details dfn\ndialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5\nh6 head header hgroup hr html i iframe img input ins kbd keygen label legend li\nlink main map mark menu menuitem meta meter nav noscript object ol optgroup\noption output p param picture pre progress q rp rt ruby s samp script section\nselect small source span strong style sub summary sup table tbody td textarea\ntfoot th thead time title tr track u ul var video wbr".replace(/\n/g, ' ').split(' ').forEach(function (tag) {
    var exportName = "" + tag.charAt(0).toUpperCase() + tag.slice(1);
    Tags[exportName] = toSubscribable(tag);
});
