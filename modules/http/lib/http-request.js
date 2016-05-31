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
System.register(['@react-mvi/core', './shims/query-string', './shims/promise', './shims/fetch'], function(exports_1, context_1) {
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
    var core_1, query_string_1, promise_1, fetch_1;
    var HTTP_INTERCEPT, HTTP_REQUEST_INTERCEPT, HttpRequest;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (query_string_1_1) {
                query_string_1 = query_string_1_1;
            },
            function (promise_1_1) {
                promise_1 = promise_1_1;
            },
            function (fetch_1_1) {
                fetch_1 = fetch_1_1;
            }],
        execute: function() {
            exports_1("IOResponse", core_1.IOResponse);
            exports_1("HttpMethod", core_1.HttpMethod);
            exports_1("ResponseType", core_1.ResponseType);
            exports_1("HTTP_INTERCEPT", HTTP_INTERCEPT = core_1.Symbol('__http_request_intercept__'));
            exports_1("HTTP_REQUEST_INTERCEPT", HTTP_REQUEST_INTERCEPT = core_1.Symbol('__http_request_request_intercept__'));
            /**
             * Http request sender.
             */
            HttpRequest = (function () {
                /**
                 * @param filters Filter processoers.
                 */
                function HttpRequest() {
                    this.store = new core_1.SubjectStore();
                    this.res = new core_1.IOResponse(this.store);
                }
                /**
                 * Wait for request from observables.
                 * @override
                 * @param request Observable that send request.
                 */
                HttpRequest.prototype.wait = function (request) {
                    var _this = this;
                    return request.subscribe(function (config) {
                        var subjects = _this.store.get(config.key);
                        (function () {
                            switch (config.method) {
                                case core_1.HttpMethod.GET:
                                    return _this.get(config);
                                case core_1.HttpMethod.POST:
                                    return _this.post(config);
                                case core_1.HttpMethod.PUT:
                                    return _this.put(config);
                                default:
                                    return _this.get(config);
                            }
                        })()
                            .then(function (res) {
                            _this.getResponse(config.responseType, res).then(function (res) { return subjects.forEach(function (subject) { return subject.next(res); }); });
                        }).catch(function (err) {
                            _this.getResponse(config.responseType, err).then(function (err) { return subjects.forEach(function (subject) { return subject.error(err); }); });
                        });
                    });
                };
                /**
                 * Dispose all subscriptions.
                 * @override
                 */
                HttpRequest.prototype.end = function () {
                    this.store.end();
                };
                Object.defineProperty(HttpRequest.prototype, "response", {
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
                HttpRequest.prototype.get = function (_a) {
                    var url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? null : _c, mode = _a.mode;
                    return fetch_1.fetch(data ? url + "?" + query_string_1.querystring.stringify(data) : url, {
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
                HttpRequest.prototype.post = function (_a) {
                    var url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? {} : _c, _d = _a.json, json = _d === void 0 ? true : _d, mode = _a.mode;
                    return fetch_1.fetch(url, {
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
                HttpRequest.prototype.put = function (_a) {
                    var url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? {} : _c, _d = _a.json, json = _d === void 0 ? true : _d, mode = _a.mode;
                    return fetch_1.fetch(url, {
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
                HttpRequest.prototype.delete = function (_a) {
                    var url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? {} : _c, _d = _a.json, json = _d === void 0 ? true : _d, mode = _a.mode;
                    return fetch_1.fetch(url, {
                        headers: headers,
                        method: 'DELETE',
                        mode: mode || 'same-origin',
                        body: json ? JSON.stringify(data) : data
                    });
                };
                /**
                 * Get proper response from fetch response body.
                 * @param responseType The type of response. ex. ARRAY_BUFFER, BLOB, etc...
                 * @param res Http response.
                 * @returns
                 */
                HttpRequest.prototype.getResponse = function (responseType, res) {
                    switch (responseType) {
                        case core_1.ResponseType.ARRAY_BUFFER:
                            return res.arrayBuffer();
                        case core_1.ResponseType.BLOB:
                            return res.blob();
                        case core_1.ResponseType.FORM_DATA:
                            return res.formData();
                        case core_1.ResponseType.JSON:
                            return res.json();
                        case core_1.ResponseType.TEXT:
                            return res.text();
                        default:
                            return res.text();
                    }
                };
                __decorate([
                    core_1.intercept(HTTP_REQUEST_INTERCEPT), 
                    __metadata('design:type', Function), 
                    __metadata('design:paramtypes', [Object]), 
                    __metadata('design:returntype', promise_1.Promise)
                ], HttpRequest.prototype, "get", null);
                __decorate([
                    core_1.intercept(HTTP_REQUEST_INTERCEPT), 
                    __metadata('design:type', Function), 
                    __metadata('design:paramtypes', [Object]), 
                    __metadata('design:returntype', promise_1.Promise)
                ], HttpRequest.prototype, "post", null);
                __decorate([
                    core_1.intercept(HTTP_REQUEST_INTERCEPT), 
                    __metadata('design:type', Function), 
                    __metadata('design:paramtypes', [Object]), 
                    __metadata('design:returntype', promise_1.Promise)
                ], HttpRequest.prototype, "put", null);
                __decorate([
                    core_1.intercept(HTTP_REQUEST_INTERCEPT), 
                    __metadata('design:type', Function), 
                    __metadata('design:paramtypes', [Object]), 
                    __metadata('design:returntype', promise_1.Promise)
                ], HttpRequest.prototype, "delete", null);
                __decorate([
                    core_1.intercept(HTTP_INTERCEPT), 
                    __metadata('design:type', Function), 
                    __metadata('design:paramtypes', [Number, fetch_1.Response]), 
                    __metadata('design:returntype', promise_1.Promise)
                ], HttpRequest.prototype, "getResponse", null);
                return HttpRequest;
            }());
            exports_1("HttpRequest", HttpRequest);
        }
    }
});
