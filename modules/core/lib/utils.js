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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var OBJECT_REGEXP = /\[object ([^\]]+)\]/;
var toStringClass = function (o) { return o ? Object.prototype.toString.call(o).match(OBJECT_REGEXP)[1] : 'null'; };
function isDefined(obj) {
    return obj !== undefined && obj !== null;
}
exports.isDefined = isDefined;
function assign(base, append) {
    return __assign({}, base, append);
}
exports.assign = assign;
function extend(base, append) {
    for (var key in append) {
        base[key] = append[key];
    }
    return base;
}
exports.extend = extend;
function omit(obj, name) {
    var keys = Object.keys(obj || {});
    var ret = {};
    var omits = typeof name === 'string' ? [name] : name;
    for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];
        if (omits.indexOf(key) === -1) {
            ret[key] = obj[key];
        }
    }
    return ret;
}
exports.omit = omit;
function forIn(obj, cb) {
    for (var key in obj || {}) {
        cb(obj[key], key, obj);
    }
}
exports.forIn = forIn;
function isObject(obj) {
    return toStringClass(obj) === 'Object';
}
exports.isObject = isObject;
function isArray(obj) {
    return toStringClass(obj) === 'Array';
}
exports.isArray = isArray;
function isRegExp(obj) {
    return toStringClass(obj) === 'RegExp';
}
exports.isRegExp = isRegExp;
function filter(obj, cb) {
    if (isArray(obj)) {
        return obj.filter(cb);
    }
    var ret = [];
    for (var key in obj || {}) {
        if (cb(obj[key], key, obj)) {
            ret.push(obj[key]);
        }
    }
    return ret;
}
exports.filter = filter;
function map(obj, cb) {
    if (isArray(obj)) {
        return obj.map(cb);
    }
    var ret = [];
    for (var key in obj || {}) {
        ret.push(cb(obj[key], key, obj));
    }
    return ret;
}
exports.map = map;
function some(obj, cb) {
    if (isArray(obj)) {
        return obj.some(cb);
    }
    else if (isObject(obj)) {
        for (var key in obj || {}) {
            if (cb(obj[key], key, obj)) {
                return true;
            }
        }
    }
    return false;
}
exports.some = some;
function mapValues(obj, cb) {
    var ret = {};
    for (var key in obj || {}) {
        ret[key] = cb(obj[key], key, obj);
    }
    return ret;
}
exports.mapValues = mapValues;
function clone(target) {
    if (isObject(target)) {
        var ret = {};
        for (var key in target || {}) {
            ret[key] = target[key];
        }
        return ret;
    }
    else if (isArray(target)) {
        return target.slice();
    }
    return target;
}
exports.clone = clone;
