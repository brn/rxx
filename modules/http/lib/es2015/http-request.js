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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/// <reference path="./declarations.d.ts"/>
import { io, isDefined, Symbol, intercept, Outlet } from '@react-mvi/core';
import { Subscription, ConnectableObservable, Subject } from 'rxjs/Rx';
import { HttpResponseImpl, HttpUploadProgressImpl } from './http-response';
import { querystring as qs } from './shims/query-string';
import { Promise } from './shims/promise';
import { fetch, Response } from './shims/fetch';
import { HttpMethod, ResponseType, UploadEventType } from './types';
export var HTTP_RESPONSE_INTERCEPT = Symbol('__http_request_intercept__');
export var HTTP_REQUEST_INTERCEPT = Symbol('__http_request_request_intercept__');
var typeMatcher = /\[object ([^\]]+)\]/;
/**
 * Http request sender.
 */
var HttpRequest = (function (_super) {
    __extends(HttpRequest, _super);
    function HttpRequest() {
        var _this = _super.apply(this, arguments) || this;
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
        var subscription = new Subscription();
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
                if (req instanceof ConnectableObservable || typeof req.connect === 'function') {
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
                    if (e.type !== UploadEventType.PROGRESS) {
                        sub.unsubscribe();
                        var isComplete_1 = e.type !== UploadEventType.COMPLETE;
                        var contentType = e.xhr.getResponseHeader('Content-Type') || '';
                        var response_1 = config.responseType === ResponseType.JSON || contentType.indexOf('application/json') > -1 ? JSON.parse(e.xhr.responseText) : e.xhr.responseText;
                        var headers = e.xhr.getAllResponseHeaders();
                        var headerArr = headers.split('\n');
                        var headerMap_1 = {};
                        headerArr.forEach(function (e) {
                            var _a = e.split(':'), key = _a[0], value = _a[1];
                            if (key && value) {
                                headerMap_1[key.trim()] = value.trim();
                            }
                        });
                        subjects.forEach(function (subject) { return subject.next(new HttpResponseImpl(e.type === UploadEventType.COMPLETE, e.xhr.status, headerMap_1, isComplete_1 ? response_1 : null, isComplete_1 ? null : response_1)); });
                    }
                    else {
                        subjects.forEach(function (subject) { return subject.next(new HttpUploadProgressImpl(e.event, e.xhr)); });
                    }
                });
            });
        }
        return (function () {
            switch (config.method) {
                case HttpMethod.GET:
                    return _this.get(config);
                case HttpMethod.POST:
                    return _this.post(config);
                case HttpMethod.PUT:
                    return _this.put(config);
                case HttpMethod.DELETE:
                    return _this.delete(config);
                default:
                    return _this.get(config);
            }
        })()
            .then(function (res) {
            // For IE|Edge
            if (!res.url) {
                res.url = config.url;
            }
            var handler = function (result) {
                var headers = _this.processHeaders(res);
                var response = new HttpResponseImpl(res.ok, res.status, headers, res.ok ? result : null, res.ok ? null : result);
                subjects.forEach(function (subject) { return subject.next(response); });
            };
            if (res.ok) {
                _this.getResponse(config.responseType, res).then(handler);
            }
            else {
                var result = _this.getResponse(_this.getResponseTypeFromHeader(res), res);
                if (result && result.then) {
                    result.then(handler);
                }
                else {
                    handler(result);
                }
            }
        }).catch(function (err) {
            var handler = function (result) {
                var response = new HttpResponseImpl(false, err && err.status ? err.status : 500, {}, null, result);
                subjects.forEach(function (subject) { return subject.next(response); });
            };
            if (err && typeof err.json === 'function') {
                _this.getResponse(config.responseType, err).then(handler);
            }
            else {
                handler(err);
            }
        });
    };
    /**
     * @inheritDoc
     */
    HttpRequest.prototype.callback = function (key, value) {
        var _this = this;
        return function (args) { return _this.push(key, isDefined(value) ? value : args); };
    };
    HttpRequest.prototype.processHeaders = function (res) {
        var headers = {};
        res.headers.forEach(function (v, k) { return headers[k] = v; });
        return headers;
    };
    Object.defineProperty(HttpRequest.prototype, "fetch", {
        get: function () {
            return fetch;
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
        return this.fetch(data ? url + "?" + qs.stringify(data) : url, {
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
        return this.fetch(url, {
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
        return this.fetch(url, {
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
        if (isDefined(data)) {
            req['body'] = json ? JSON.stringify(data) : form ? this.serialize(data) : data;
        }
        return this.fetch(url, req);
    };
    HttpRequest.prototype.upload = function (_a) {
        var method = _a.method, url = _a.url, _b = _a.headers, headers = _b === void 0 ? {} : _b, _c = _a.data, data = _c === void 0 ? {} : _c, mode = _a.mode;
        var xhr = new XMLHttpRequest();
        var subject = new Subject();
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
            addEvent(xhr.upload, 'progress', function (e) { return subject.next({ type: UploadEventType.PROGRESS, event: e, xhr: xhr }); });
        }
        addEvent(xhr, 'error', function (e) { return subject.next({ type: UploadEventType.ERROR, event: e, xhr: xhr }); }, true);
        addEvent(xhr, 'abort', function (e) { return subject.next({ type: UploadEventType.ABORT, event: e, xhr: xhr }); }, true);
        addEvent(xhr, 'load', function (e) {
            if (!xhr.upload) {
                subject.next({ type: UploadEventType.PROGRESS, event: { total: 1, loaded: 1 }, xhr: xhr });
            }
            subject.next({ type: UploadEventType.COMPLETE, event: e, xhr: xhr });
        }, true);
        xhr.open(HttpMethod[method], url, true);
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
            case ResponseType.ARRAY_BUFFER:
                return res.arrayBuffer();
            case ResponseType.BLOB:
                return res.blob();
            case ResponseType.FORM_DATA:
                return res.formData();
            case ResponseType.JSON:
                return res.json();
            case ResponseType.TEXT:
                return res.text();
            case ResponseType.STREAM:
                return Promise.resolve(res['body']);
            default:
                return res.text();
        }
    };
    HttpRequest.prototype.getResponseTypeFromHeader = function (res) {
        var mime = res.headers.get('content-type');
        if (mime.indexOf('text/plain') > -1) {
            return ResponseType.TEXT;
        }
        if (mime.indexOf('text/json') > -1 || mime.indexOf('application/json') > -1) {
            return ResponseType.JSON;
        }
        if (/^(?:image|audio|video|(?:application\/zip)|(?:application\/octet-stream))/.test(mime)) {
            return ResponseType.BLOB;
        }
        return ResponseType.TEXT;
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
}(Outlet));
__decorate([
    intercept(HTTP_REQUEST_INTERCEPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HttpRequest.prototype, "get", null);
__decorate([
    intercept(HTTP_REQUEST_INTERCEPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HttpRequest.prototype, "post", null);
__decorate([
    intercept(HTTP_REQUEST_INTERCEPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HttpRequest.prototype, "put", null);
__decorate([
    intercept(HTTP_REQUEST_INTERCEPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HttpRequest.prototype, "delete", null);
__decorate([
    intercept(HTTP_REQUEST_INTERCEPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HttpRequest.prototype, "upload", null);
__decorate([
    intercept(HTTP_RESPONSE_INTERCEPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Response]),
    __metadata("design:returntype", Promise)
], HttpRequest.prototype, "getResponse", null);
HttpRequest = __decorate([
    io,
    __metadata("design:paramtypes", [])
], HttpRequest);
export { HttpRequest };
