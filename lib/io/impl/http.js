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
System.register(['whatwg-fetch', 'es6-promise', 'query-string', 'lodash', '../../di/inject', '../io'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = (this && this.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
    var es6_promise_1, qs, _, inject_1, io_1;
    var HttpRquest;
    return {
        setters:[
            function (_1) {},
            function (es6_promise_1_1) {
                es6_promise_1 = es6_promise_1_1;
            },
            function (qs_1) {
                qs = qs_1;
            },
            function (_2) {
                _ = _2;
            },
            function (inject_1_1) {
                inject_1 = inject_1_1;
            },
            function (io_1_1) {
                io_1 = io_1_1;
            }],
        execute: function() {
            exports_1("IOResponse", io_1.IOResponse);
            exports_1("HttpMethod", io_1.HttpMethod);
            exports_1("ResponseType", io_1.ResponseType);
            /**
             * Http request sender.
             */
            HttpRquest = (function () {
                /**
                 * @param filters Filter processoers.
                 */
                function HttpRquest(filters) {
                    this.filters = filters;
                    this.store = new io_1.SubjectStore();
                    this.res = new io_1.IOResponse(this.store);
                }
                /**
                 * Wait for request from observables.
                 * @override
                 * @param request Observable that send request.
                 */
                HttpRquest.prototype.wait = function (request) {
                    var _this = this;
                    return request.subscribe(function (config) {
                        var subjects = _this.store.get(config.key);
                        _this.applyFilters(config, (function () {
                            switch (config.method) {
                                case io_1.HttpMethod.GET:
                                    return _this.get(config);
                                case io_1.HttpMethod.POST:
                                    return _this.post(config);
                                case io_1.HttpMethod.PUT:
                                    return _this.put(config);
                                default:
                                    return _this.get(config);
                            }
                        })()).then(function (res) {
                            subjects.forEach(function (subject) { return subject.onNext(res); });
                        }).catch(function (err) {
                            subjects.forEach(function (subject) { return subject.onError(err); });
                        });
                    });
                };
                /**
                 * Dispose all subscriptions.
                 * @override
                 */
                HttpRquest.prototype.end = function () {
                    this.store.end();
                };
                Object.defineProperty(HttpRquest.prototype, "response", {
                    /**
                     * Return response observable.
                     */
                    get: function () {
                        return this.res;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Send GET request.
                 * @data url Target url.
                 * @data data GET parameters.
                 * @returns Promise that return response.
                 */
                HttpRquest.prototype.get = function (_a) {
                    var url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? null : _c, mode = _a.mode;
                    return fetch(data ? url + "?" + qs.stringify(data) : url, {
                        method: 'GET',
                        headers: headers,
                        mode: mode || 'same-origin'
                    });
                };
                /**
                 * Send POST request.
                 * @data url Target url.
                 * @data data POST body.
                 * @returns Promise that return response.
                 */
                HttpRquest.prototype.post = function (_a) {
                    var url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? {} : _c, _d = _a.json, json = _d === void 0 ? true : _d, mode = _a.mode;
                    return fetch(url, {
                        headers: headers,
                        method: 'POST',
                        mode: mode || 'same-origin',
                        body: json ? JSON.stringify(data) : data
                    });
                };
                /**
                 * Send PUT request.
                 * @data url Target url.
                 * @data data PUT body.
                 * @returns Promise that return response.
                 */
                HttpRquest.prototype.put = function (_a) {
                    var url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? {} : _c, _d = _a.json, json = _d === void 0 ? true : _d, mode = _a.mode;
                    return fetch(url, {
                        headers: headers,
                        method: 'PUT',
                        mode: mode || 'same-origin',
                        body: json ? JSON.stringify(data) : data
                    });
                };
                /**
                 * Send DELETE request.
                 * @data url Target url.
                 * @data data PUT body.
                 * @returns Promise that return response.
                 */
                HttpRquest.prototype.delete = function (_a) {
                    var url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? {} : _c, _d = _a.json, json = _d === void 0 ? true : _d, mode = _a.mode;
                    return fetch(url, {
                        headers: headers,
                        method: 'DELETE',
                        mode: mode || 'same-origin',
                        body: json ? JSON.stringify(data) : data
                    });
                };
                /**
                 * Do filtering process.
                 * @data err Http Error
                 * @data res Http response
                 * @data resolve Success handler.
                 * @data reject Error handler.
                 */
                HttpRquest.prototype.applyFilters = function (config, responsePromise) {
                    var _this = this;
                    return responsePromise.then(function (res) {
                        return _this.getResponse(config.responseType, res).then(function (res) { return ({ err: null, res: res }); });
                    }, function (err) {
                        return _this.getResponse(config.responseType, err).then(function (err) { return ({ err: err, res: null }); });
                    }).then(function (filteredResult) {
                        return new es6_promise_1.Promise(function (resolve, reject) {
                            _.every(_this.filters, function (filter) {
                                try {
                                    filteredResult = filter.filter(filteredResult);
                                }
                                finally {
                                    return filteredResult;
                                }
                            });
                            if (!!filteredResult) {
                                if (!filteredResult.err) {
                                    return resolve(filteredResult.res);
                                }
                                reject(filteredResult.err);
                            }
                        });
                    });
                };
                /**
                 * Get proper response from fetch response body.
                 * @param responseType The type of response. ex. ARRAY_BUFFER, BLOB, etc...
                 * @param res Http response.
                 * @returns
                 */
                HttpRquest.prototype.getResponse = function (responseType, res) {
                    switch (responseType) {
                        case io_1.ResponseType.ARRAY_BUFFER:
                            return res.arrayBuffer();
                        case io_1.ResponseType.BLOB:
                            return res.blob();
                        case io_1.ResponseType.FORM_DATA:
                            return res.formData();
                        case io_1.ResponseType.JSON:
                            return res.json();
                        case io_1.ResponseType.TEXT:
                            return res.text();
                        default:
                            return res.text();
                    }
                };
                HttpRquest = __decorate([
                    __param(0, inject_1.param(/.+Filter/)), 
                    __metadata('design:paramtypes', [Array])
                ], HttpRquest);
                return HttpRquest;
            }());
            exports_1("HttpRquest", HttpRquest);
        }
    }
});
