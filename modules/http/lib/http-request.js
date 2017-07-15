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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@react-mvi/core");
var Rx_1 = require("rxjs/Rx");
var http_response_1 = require("./http-response");
var qs_1 = require("./qs");
var types_1 = require("./types");
exports.HTTP_RESPONSE_INTERCEPT = Symbol('__http_request_intercept__');
exports.HTTP_REQUEST_INTERCEPT = Symbol('__http_request_request_intercept__');
var typeMatcher = /\[object ([^\]]+)\]/;
/**
 * Http request sender.
 */
var HttpRequest = (function (_super) {
    __extends(HttpRequest, _super);
    function HttpRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.history = [];
        return _this;
    }
    /**
     * Wait for request from observables.
     * @override
     * @param request Observable that send request.
     */
    HttpRequest.prototype.subscribe = function (props) {
        var _this = this;
        var subscription = new Rx_1.Subscription();
        if (props['http']) {
            var _loop_1 = function (reqKey) {
                var req = props['http'][reqKey];
                subscription.add(req.subscribe(function (config) { return _this.push(reqKey, config); }));
            };
            for (var reqKey in props['http']) {
                _loop_1(reqKey);
            }
            for (var reqKey in props['http']) {
                var req = props['http'][reqKey];
                if (req instanceof Rx_1.ConnectableObservable || typeof req.connect === 'function') {
                    req.connect();
                }
            }
        }
        return subscription;
    };
    /**
     * @inheritDoc
     */
    HttpRequest.prototype.push = function (key, args) {
        var _this = this;
        if (key === 'RETRY') {
            var history_1 = this.history[this.history.length - (typeof args === 'number' ? (args + 1) : 1)];
            if (!history_1) {
                return new Promise(function (_, r) { return r(new Error('Invlaid retry number specified.')); });
            }
            key = history_1.key;
            args = history_1.args;
        }
        else {
            if (this.history.length > 10) {
                this.history.shift();
            }
            this.history.push({ key: key, args: args });
        }
        if (!args) {
            return new Promise(function (_, r) { return r(new Error('Config required.')); });
        }
        var config = args;
        var subjects = this.store.get(key);
        if (config.upload) {
            return this.upload(config).then(function (subject) {
                var sub = subject.subscribe(function (e) {
                    if (e.type !== types_1.UploadEventType.PROGRESS) {
                        sub.unsubscribe();
                        var isComplete_1 = e.type !== types_1.UploadEventType.COMPLETE;
                        var contentType = e.xhr.getResponseHeader('Content-Type') || '';
                        var response_1 = config.responseType === types_1.ResponseType.JSON || contentType.indexOf('application/json') > -1 ? JSON.parse(e.xhr.responseText) : e.xhr.responseText;
                        var headers = e.xhr.getAllResponseHeaders();
                        var headerArr = headers.split('\n');
                        var headerMap_1 = {};
                        headerArr.forEach(function (e) {
                            var _a = e.split(':'), key = _a[0], value = _a[1];
                            if (key && value) {
                                headerMap_1[key.trim()] = value.trim();
                            }
                        });
                        subjects.forEach(function (subject) { return subject.next(new http_response_1.HttpResponseImpl(e.type === types_1.UploadEventType.COMPLETE, e.xhr.status, headerMap_1, isComplete_1 ? response_1 : null, isComplete_1 ? null : response_1)); });
                    }
                    else {
                        subjects.forEach(function (subject) { return subject.next(new http_response_1.HttpUploadProgressImpl(e.event, e.xhr)); });
                    }
                });
            });
        }
        var errorHandler = function (err, result) {
            var response = new http_response_1.HttpResponseImpl(false, err && err.status ? err.status : 500, {}, null, result);
            subjects.forEach(function (subject) { return subject.next(response); });
        };
        var succeededHandler = function (response, result) {
            var headers = _this.processHeaders(response);
            var httpResponse = new http_response_1.HttpResponseImpl(response.ok, response.status, headers, response.ok ? result : null, response.ok ? null : result);
            subjects.forEach(function (subject) { return subject.next(httpResponse); });
        };
        return (function () {
            switch (config.method) {
                case types_1.HttpMethod.GET:
                    return _this.get(config);
                case types_1.HttpMethod.POST:
                    return _this.post(config);
                case types_1.HttpMethod.PUT:
                    return _this.put(config);
                case types_1.HttpMethod.DELETE:
                    return _this.delete(config);
                default:
                    return _this.get(config);
            }
        })()
            .then(function (res) {
            // For IE|Edge
            if (!res.url) {
                var u = 'ur' + 'l';
                try {
                    res[u] = config.url;
                }
                catch (e) { }
            }
            if (res.ok) {
                var resp = _this.getResponse(config.responseType, res);
                if (resp && resp.then) {
                    resp.then(function (ret) { return succeededHandler(res, ret); }, function (e) { return errorHandler(null, e); });
                }
            }
            else {
                var result = _this.getResponse(_this.getResponseTypeFromHeader(res), res);
                if (result && result.then) {
                    result.then(function (ret) { return succeededHandler(res, ret); }, function (e) { return errorHandler(null, e); });
                }
                else {
                    succeededHandler(res, result);
                }
            }
        }, function (err) {
            if (err && typeof err.json === 'function') {
                var resp = _this.getResponse(config.responseType, err);
                if (resp && resp.then) {
                    resp.then(function (e) { return errorHandler(err, e); }, function (e) { return errorHandler(err, e); });
                }
            }
            else {
                errorHandler(err, err);
            }
        });
    };
    /**
     * @inheritDoc
     */
    HttpRequest.prototype.callback = function (key, value) {
        var _this = this;
        return function (args) { return _this.push(key, core_1.isDefined(value) ? value : args); };
    };
    HttpRequest.prototype.processHeaders = function (res) {
        var headers = {};
        res.headers.forEach(function (v, k) { return headers[k] = v; });
        return headers;
    };
    HttpRequest.prototype.getFetcher = function () {
        return fetch;
    };
    /**
     * Send GET request.
     * @data url Target url.
     * @data data GET parameters.
     * @returns Promise that return response.
     */
    HttpRequest.prototype.get = function (_a) {
        var url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? null : _c, mode = _a.mode;
        return this.getFetcher()(data ? "" + url + qs_1.qs(data) : url, {
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
        var url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? {} : _c, _d = _a.json, json = _d === void 0 ? true : _d, _e = _a.form, form = _e === void 0 ? false : _e, mode = _a.mode;
        return this.getFetcher()(url, {
            headers: headers,
            method: 'POST',
            mode: mode || 'same-origin',
            body: json ? JSON.stringify(data) : form ? this.serialize(data) : data
        });
    };
    /**
     * Send PUT request.
     * @data url Target url.
     * @data data PUT body.
     * @returns Promise that return response.
     */
    HttpRequest.prototype.put = function (_a) {
        var url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? {} : _c, _d = _a.json, json = _d === void 0 ? true : _d, _e = _a.form, form = _e === void 0 ? false : _e, mode = _a.mode;
        return this.getFetcher()(url, {
            headers: headers,
            method: 'PUT',
            mode: mode || 'same-origin',
            body: json ? JSON.stringify(data) : form ? this.serialize(data) : data
        });
    };
    /**
     * Send DELETE request.
     * @data url Target url.
     * @data data PUT body.
     * @returns Promise that return response.
     */
    HttpRequest.prototype.delete = function (_a) {
        var url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? {} : _c, _d = _a.json, json = _d === void 0 ? true : _d, _e = _a.form, form = _e === void 0 ? false : _e, mode = _a.mode;
        var req = {
            headers: headers,
            method: 'DELETE',
            mode: mode || 'same-origin'
        };
        if (core_1.isDefined(data)) {
            req['body'] = json ? JSON.stringify(data) : form ? this.serialize(data) : data;
        }
        return this.getFetcher()(url, req);
    };
    HttpRequest.prototype.upload = function (_a) {
        var method = _a.method, url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? {} : _c, mode = _a.mode;
        var xhr = new XMLHttpRequest();
        var subject = new Rx_1.Subject();
        var events = {};
        var addEvent = function (xhr, type, fn, dispose) {
            if (dispose === void 0) { dispose = false; }
            events[type] = function (e) {
                if (dispose) {
                    for (var key in events) {
                        xhr.removeEventListener(key, events[key]);
                    }
                }
                fn(e);
            };
            xhr.addEventListener(type, events[type], false);
        };
        if (xhr.upload) {
            addEvent(xhr.upload, 'progress', function (e) { return subject.next({ type: types_1.UploadEventType.PROGRESS, event: e, xhr: xhr }); });
        }
        addEvent(xhr, 'error', function (e) { return subject.next({ type: types_1.UploadEventType.ERROR, event: e, xhr: xhr }); }, true);
        addEvent(xhr, 'abort', function (e) { return subject.next({ type: types_1.UploadEventType.ABORT, event: e, xhr: xhr }); }, true);
        addEvent(xhr, 'load', function (e) {
            if (!xhr.upload) {
                subject.next({ type: types_1.UploadEventType.PROGRESS, event: { total: 1, loaded: 1 }, xhr: xhr });
            }
            subject.next({ type: types_1.UploadEventType.COMPLETE, event: e, xhr: xhr });
        }, true);
        xhr.open(types_1.HttpMethod[method], url, true);
        for (var key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }
        xhr.send(data);
        return Promise.resolve(subject);
    };
    /**
     * Get proper response from fetch response body.
     * @param responseType The type of response. ex. ARRAY_BUFFER, BLOB, etc...
     * @param res Http response.
     * @returns
     */
    HttpRequest.prototype.getResponse = function (responseType, res) {
        switch (responseType) {
            case types_1.ResponseType.ARRAY_BUFFER:
                return res.arrayBuffer();
            case types_1.ResponseType.BLOB:
                return res.blob();
            case types_1.ResponseType.FORM_DATA:
                return res.formData();
            case types_1.ResponseType.JSON:
                return res.json();
            case types_1.ResponseType.TEXT:
                return res.text();
            case types_1.ResponseType.STREAM:
                return Promise.resolve(res['body']);
            default:
                return res.text();
        }
    };
    HttpRequest.prototype.getResponseTypeFromHeader = function (res) {
        var mime = res.headers.get('content-type');
        if (mime.indexOf('text/plain') > -1) {
            return types_1.ResponseType.TEXT;
        }
        if (mime.indexOf('text/json') > -1 || mime.indexOf('application/json') > -1) {
            return types_1.ResponseType.JSON;
        }
        if (/^(?:image|audio|video|(?:application\/zip)|(?:application\/octet-stream))/.test(mime)) {
            return types_1.ResponseType.BLOB;
        }
        return types_1.ResponseType.TEXT;
    };
    HttpRequest.prototype.serialize = function (data) {
        var ret = [];
        this.doSerialize(data, ret);
        return ret.join('&');
    };
    HttpRequest.prototype.doSerialize = function (data, resultCollection, parentKey) {
        if (parentKey === void 0) { parentKey = ''; }
        var type = this.getType(data);
        if (type === 'Object') {
            for (var key in data) {
                var valueType = this.getType(data[key]);
                var keyValue = "" + (parentKey ? parentKey + '.' : '') + key;
                if (valueType === 'String' ||
                    valueType === 'Number' ||
                    valueType === 'RegExp' ||
                    valueType === 'Boolean') {
                    resultCollection.push(keyValue + "=" + String(data[key]));
                }
                else if (valueType === 'Date') {
                    resultCollection.push(keyValue + "=" + +(data[key]));
                }
                else if (valueType === 'Object') {
                    this.doSerialize(data[key], resultCollection, key);
                }
                else if (valueType === 'Array') {
                    this.doSerialize(data[key], resultCollection, key);
                }
            }
        }
        else if (type === 'Array') {
            for (var i = 0, len = data.length; i < len; i++) {
                resultCollection.push(parentKey + "[i]=" + data[i]);
            }
        }
    };
    HttpRequest.prototype.getType = function (value) {
        return Object.prototype.toString.call(value).match(typeMatcher)[1];
    };
    return HttpRequest;
}(core_1.Outlet));
__decorate([
    core_1.intercept(exports.HTTP_REQUEST_INTERCEPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HttpRequest.prototype, "get", null);
__decorate([
    core_1.intercept(exports.HTTP_REQUEST_INTERCEPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HttpRequest.prototype, "post", null);
__decorate([
    core_1.intercept(exports.HTTP_REQUEST_INTERCEPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HttpRequest.prototype, "put", null);
__decorate([
    core_1.intercept(exports.HTTP_REQUEST_INTERCEPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HttpRequest.prototype, "delete", null);
__decorate([
    core_1.intercept(exports.HTTP_REQUEST_INTERCEPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HttpRequest.prototype, "upload", null);
__decorate([
    core_1.intercept(exports.HTTP_RESPONSE_INTERCEPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Response]),
    __metadata("design:returntype", Promise)
], HttpRequest.prototype, "getResponse", null);
HttpRequest = __decorate([
    core_1.io
], HttpRequest);
exports.HttpRequest = HttpRequest;
