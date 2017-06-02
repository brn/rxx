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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Create functor that is function behave like class.
 * @param {Function} fn The function that want to define methods.
 * @param {Object} props Methods.
 * @returns {Function}
 */
function functor(fn, props) {
    for (var prop in props) {
        fn[prop] = props[prop];
    }
    return fn;
}
/**
 * Exit async function gracefully.
 * @param {Function} cb Async function.
 * @param {Function} done The Mocha async test case exit callback.
 * @returns {Function} The function that is notify error to mocha.
 */
exports.graceful = functor(function (cb, done, optCallback) { return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var error;
    try {
        cb.apply(_this, args);
    }
    catch (e) {
        error = e;
    }
    finally {
        optCallback && optCallback();
        done(error);
    }
}; }, {
    /**
     * Run graceful function.
     * @param {Function} cb Async function.
     * @param {Function} done The Mocha async test case exit callback.
     * @returns {*} Function return value.
     */
    run: function (cb, done, optCallback) { return exports.graceful(cb, done, optCallback)(); }
});
/**
 * Create function that exit async test case.
 * @param {Function} done The Mocha async test case exit callback.
 * @returns {Function} Function that exit async test case.
 */
exports.nothing = function (done, optCallback) { return function () { return (optCallback && optCallback(), done()); }; };
/**
 * Create function that exit test case if error thrown.
 * @param {Function} cb Async function.
 * @param {Function} done The Mocha async test case exit callback.
 * @returns {Function} Function that exit async test case if error thrown.
 */
exports.stopOnError = functor(function (cb, done, optCallback) { return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    try {
        return cb.apply(_this, args);
    }
    catch (e) {
        optCallback && optCallback();
        done(e);
    }
}; }, {
    run: function (cb, done, optCallback) { return exports.stopOnError(cb, done, optCallback)(); }
});
var Joiner = (function () {
    function Joiner(time, cb) {
        this.time = time;
        this.cb = cb;
        this.current = 0;
    }
    Joiner.prototype.notify = function () {
        if (++this.current == this.time) {
            this.cb();
        }
    };
    return Joiner;
}());
exports.Joiner = Joiner;
