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
System.register(['./component/context', './component/subscriber', './component/tags', './component/utils', './run', './service/service', './io/io', './utils', './di/index', './shims/symbol'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function exportStar_1(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters:[
            function (context_2_1) {
                exportStar_1(context_2_1);
            },
            function (subscriber_1_1) {
                exportStar_1(subscriber_1_1);
            },
            function (tags_1_1) {
                exportStar_1(tags_1_1);
            },
            function (utils_1_1) {
                exportStar_1(utils_1_1);
            },
            function (run_1_1) {
                exportStar_1(run_1_1);
            },
            function (service_1_1) {
                exportStar_1(service_1_1);
            },
            function (io_1_1) {
                exportStar_1(io_1_1);
            },
            function (utils_2_1) {
                exportStar_1(utils_2_1);
            },
            function (index_1_1) {
                exportStar_1(index_1_1);
            },
            function (symbol_1_1) {
                exportStar_1(symbol_1_1);
            }],
        execute: function() {
        }
    }
});
