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
Object.defineProperty(exports, "__esModule", { value: true });
var Rx_1 = require("rxjs/Rx");
exports.IO_MARK = Symbol('io');
/**
 * Decorator for io module.
 */
function io(target) {
    target[exports.IO_MARK] = true;
}
exports.io = io;
/**
 * Represent IO response.
 */
var IOResponse = (function () {
    function IOResponse(subjectStore) {
        this.subjectStore = subjectStore;
    }
    ;
    /**
     * Get a subject by specify key.
     * @param key Subject name.
     * @returns Registered Subject.
     */
    IOResponse.prototype.for = function (key) {
        if (!this.subjectStore.hasWithoutGlobal(key)) {
            return this.subjectStore.add(key);
        }
        return this.subjectStore.getWithoutGlobal(key);
    };
    return IOResponse;
}());
exports.IOResponse = IOResponse;
/**
 * Hold Subject cache.
 */
var SubjectStore = (function () {
    function SubjectStore(subjectMap) {
        if (subjectMap === void 0) { subjectMap = {}; }
        this.subjectMap = subjectMap;
    }
    SubjectStore.prototype.hasWithoutGlobal = function (key) {
        return !!this.subjectMap[key];
    };
    /**
     * Check whether Subject was defined with specific key or not.
     * @param key Subject name.
     * @return True if Subject was defined.
     */
    SubjectStore.prototype.has = function (key) {
        var splited = key.split('::');
        var globalKey = splited.length > 1 ? "*::" + splited[1] : null;
        return this.subjectMap[key] || (globalKey ? this.subjectMap[globalKey] : false);
    };
    SubjectStore.prototype.getWithoutGlobal = function (key) {
        if (this.subjectMap[key]) {
            return this.subjectMap[key];
        }
        return null;
    };
    /**
     * Get Subject by specific key.
     * @param key Subject name.
     * @returns Registered Subject.
     */
    SubjectStore.prototype.get = function (key) {
        var ret = [];
        var splited = key.split('::');
        var globalKey = splited.length > 1 ? "*::" + splited[1] : null;
        var globalBus = globalKey && this.subjectMap[globalKey] ? this.subjectMap[globalKey] : null;
        if (this.subjectMap[key]) {
            ret.push(this.subjectMap[key]);
        }
        if (globalBus) {
            ret.push(globalBus);
        }
        return ret;
    };
    /**
     * Append new Subject.
     * @param key Subject name.
     * @returns Registered Subject.
     */
    SubjectStore.prototype.add = function (key) {
        return this.subjectMap[key] = new Rx_1.Subject();
    };
    return SubjectStore;
}());
exports.SubjectStore = SubjectStore;
var Outlet = (function () {
    function Outlet() {
        /**
         * Subject for exported stream.
         */
        this.store = new SubjectStore();
        this.ioResponse = new IOResponse(this.store);
    }
    Object.defineProperty(Outlet.prototype, "response", {
        /**
         * Return response representation of stream.
         * @return Representation of stream response.
         */
        get: function () {
            return this.ioResponse;
        },
        enumerable: true,
        configurable: true
    });
    return Outlet;
}());
exports.Outlet = Outlet;
;
