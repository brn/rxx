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
System.register(['../io', 'js-cookie'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var io_1, Cookies;
    var CookieStorage, LocalStorage, StorageFactory;
    return {
        setters:[
            function (io_1_1) {
                io_1 = io_1_1;
            },
            function (Cookies_1) {
                Cookies = Cookies_1;
            }],
        execute: function() {
            CookieStorage = (function () {
                function CookieStorage() {
                }
                CookieStorage.prototype.put = function (key, value, _a) {
                    var options = _a.options;
                    Cookies.set(key, value, options);
                    return value;
                };
                CookieStorage.prototype.get = function (key) {
                    return Cookies.get(key);
                };
                CookieStorage.prototype.del = function (key) {
                    var ret = Cookies.get(key);
                    Cookies.set(key, '', { expires: -1 });
                    return ret;
                };
                return CookieStorage;
            }());
            exports_1("CookieStorage", CookieStorage);
            LocalStorage = (function () {
                function LocalStorage(storage) {
                    if (storage === void 0) { storage = localStorage; }
                    this.storage = storage;
                }
                LocalStorage.prototype.put = function (key, value, _a) {
                    var options = _a.options;
                    this.storage.setItem(key, JSON.stringify(value));
                    return value;
                };
                LocalStorage.prototype.get = function (key) {
                    return JSON.parse(this.storage.getItem(key));
                };
                LocalStorage.prototype.del = function (key) {
                    var ret = this.get(key);
                    this.storage.removeItem(key);
                    return ret;
                };
                return LocalStorage;
            }());
            exports_1("LocalStorage", LocalStorage);
            StorageFactory = (function () {
                function StorageFactory() {
                    this.store = new io_1.SubjectStore();
                    this.storages = (_a = {},
                        _a[io_1.StorageType[io_1.StorageType.COOKIE]] = new CookieStorage(),
                        _a[io_1.StorageType[io_1.StorageType.LOCAL_STORAGE]] = new LocalStorage(),
                        _a[io_1.StorageType[io_1.StorageType.SESSION_STORAGE]] = new LocalStorage(sessionStorage),
                        _a
                    );
                    this.ioResponse = new io_1.IOResponse(this.store);
                    var _a;
                }
                StorageFactory.prototype.wait = function (ob) {
                    var _this = this;
                    ob.subscribe(function (v) {
                        var type = io_1.StorageType[v.type];
                        if (type && _this.storages[type]) {
                            var method_1 = io_1.StorageMethod[v.method];
                            if (!method_1)
                                return;
                            var subjects = _this.store.get(v.key);
                            subjects.forEach(function (subject) { return subject.onNext(_this.storages[v.type][method_1.toLowerCase()](v.name || v.key, v.value, v.options)); });
                        }
                    });
                };
                Object.defineProperty(StorageFactory.prototype, "response", {
                    get: function () { return this.ioResponse; },
                    enumerable: true,
                    configurable: true
                });
                return StorageFactory;
            }());
            exports_1("StorageFactory", StorageFactory);
        }
    }
});
