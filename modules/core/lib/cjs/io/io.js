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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Subject_1 = require('rxjs/Subject');
var symbol_1 = require('../shims/symbol');
var lodash_1 = require('../shims/lodash');
exports.IO_MARK = symbol_1.Symbol('io');
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
        return this.subjectMap[key] = new Subject_1.Subject();
    };
    /**
     * Dispose all subscriptions.
     */
    SubjectStore.prototype.end = function () {
        lodash_1._.forEach(this.subjectMap, function (v) { return v.complete(); });
    };
    return SubjectStore;
}());
exports.SubjectStore = SubjectStore;
var Outlet = (function () {
    function Outlet() {
        this.store = new SubjectStore();
        this.ioResponse = new IOResponse(this.store);
    }
    Object.defineProperty(Outlet.prototype, "response", {
        get: function () {
            return this.ioResponse;
        },
        enumerable: true,
        configurable: true
    });
    Outlet = __decorate([
        io, 
        __metadata('design:paramtypes', [])
    ], Outlet);
    return Outlet;
}());
exports.Outlet = Outlet;
/**
 * The methods of the Http request.
 */
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 1] = "GET";
    HttpMethod[HttpMethod["POST"] = 2] = "POST";
    HttpMethod[HttpMethod["PUT"] = 3] = "PUT";
})(exports.HttpMethod || (exports.HttpMethod = {}));
var HttpMethod = exports.HttpMethod;
/**
 * Response type of the Http request.
 */
(function (ResponseType) {
    ResponseType[ResponseType["JSON"] = 1] = "JSON";
    ResponseType[ResponseType["BLOB"] = 2] = "BLOB";
    ResponseType[ResponseType["ARRAY_BUFFER"] = 3] = "ARRAY_BUFFER";
    ResponseType[ResponseType["FORM_DATA"] = 4] = "FORM_DATA";
    ResponseType[ResponseType["TEXT"] = 5] = "TEXT";
})(exports.ResponseType || (exports.ResponseType = {}));
var ResponseType = exports.ResponseType;
;
/**
 * The methods of the StorageIO.
 */
(function (StorageMethod) {
    StorageMethod[StorageMethod["PUT"] = 1] = "PUT";
    StorageMethod[StorageMethod["GET"] = 2] = "GET";
    StorageMethod[StorageMethod["DEL"] = 3] = "DEL";
})(exports.StorageMethod || (exports.StorageMethod = {}));
var StorageMethod = exports.StorageMethod;
/**
 * The type of the Storage.
 */
(function (StorageType) {
    StorageType[StorageType["LOCAL_STORAGE"] = 1] = "LOCAL_STORAGE";
    StorageType[StorageType["SESSION_STORAGE"] = 2] = "SESSION_STORAGE";
    StorageType[StorageType["COOKIE"] = 3] = "COOKIE";
})(exports.StorageType || (exports.StorageType = {}));
var StorageType = exports.StorageType;
;
