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
System.register(['rx', 'immutable'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var rx_1, immutable_1;
    var IOResponse, SubjectStore, HttpMethod, ResponseType, StorageMethod, StorageType;
    return {
        setters:[
            function (rx_1_1) {
                rx_1 = rx_1_1;
            },
            function (immutable_1_1) {
                immutable_1 = immutable_1_1;
            }],
        execute: function() {
            /**
             * Represent IO response.
             */
            IOResponse = (function () {
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
            exports_1("IOResponse", IOResponse);
            /**
             * Hold Subject cache.
             */
            SubjectStore = (function () {
                function SubjectStore(subjectMap) {
                    if (subjectMap === void 0) { subjectMap = immutable_1.Map(); }
                    this.subjectMap = subjectMap;
                }
                SubjectStore.prototype.hasWithoutGlobal = function (key) {
                    return this.subjectMap.has(key);
                };
                /**
                 * Check whether Subject was defined with specific key or not.
                 * @param key Subject name.
                 * @return True if Subject was defined.
                 */
                SubjectStore.prototype.has = function (key) {
                    var splited = key.split('::');
                    var globalKey = splited.length > 1 ? "*::" + splited[1] : null;
                    return this.subjectMap.has(key) || (globalKey ? this.subjectMap.has(globalKey) : false);
                };
                SubjectStore.prototype.getWithoutGlobal = function (key) {
                    if (this.subjectMap.has(key)) {
                        return this.subjectMap.get(key);
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
                    var globalBus = globalKey && this.subjectMap.has(globalKey) ? this.subjectMap.get(globalKey) : null;
                    if (this.subjectMap.has(key)) {
                        ret.push(this.subjectMap.get(key));
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
                    this.subjectMap = this.subjectMap.set(key, new rx_1.Subject());
                    return this.subjectMap.get(key);
                };
                /**
                 * Dispose all subscriptions.
                 */
                SubjectStore.prototype.end = function () {
                    this.subjectMap.valueSeq().forEach(function (v) { return v.onCompleted(); });
                };
                return SubjectStore;
            }());
            exports_1("SubjectStore", SubjectStore);
            /**
             * The methods of the Http request.
             */
            (function (HttpMethod) {
                HttpMethod[HttpMethod["GET"] = 1] = "GET";
                HttpMethod[HttpMethod["POST"] = 2] = "POST";
                HttpMethod[HttpMethod["PUT"] = 3] = "PUT";
            })(HttpMethod || (HttpMethod = {}));
            exports_1("HttpMethod", HttpMethod);
            /**
             * Response type of the Http request.
             */
            (function (ResponseType) {
                ResponseType[ResponseType["JSON"] = 1] = "JSON";
                ResponseType[ResponseType["BLOB"] = 2] = "BLOB";
                ResponseType[ResponseType["ARRAY_BUFFER"] = 3] = "ARRAY_BUFFER";
                ResponseType[ResponseType["FORM_DATA"] = 4] = "FORM_DATA";
                ResponseType[ResponseType["TEXT"] = 5] = "TEXT";
            })(ResponseType || (ResponseType = {}));
            exports_1("ResponseType", ResponseType);
            /**
             * The methods of the StorageIO.
             */
            (function (StorageMethod) {
                StorageMethod[StorageMethod["PUT"] = 1] = "PUT";
                StorageMethod[StorageMethod["GET"] = 2] = "GET";
                StorageMethod[StorageMethod["DEL"] = 3] = "DEL";
            })(StorageMethod || (StorageMethod = {}));
            exports_1("StorageMethod", StorageMethod);
            /**
             * The type of the Storage.
             */
            (function (StorageType) {
                StorageType[StorageType["LOCAL_STORAGE"] = 1] = "LOCAL_STORAGE";
                StorageType[StorageType["SESSION_STORAGE"] = 2] = "SESSION_STORAGE";
                StorageType[StorageType["COOKIE"] = 3] = "COOKIE";
            })(StorageType || (StorageType = {}));
            exports_1("StorageType", StorageType);
        }
    }
});
