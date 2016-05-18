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
System.register(['es6-promise', 'chai', 'rx', 'lodash', '../http', '../../../testing/async-utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var es6_promise_1, chai_1, rx_1, _, http_1, async_utils_1;
    return {
        setters:[
            function (es6_promise_1_1) {
                es6_promise_1 = es6_promise_1_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (rx_1_1) {
                rx_1 = rx_1_1;
            },
            function (_1) {
                _ = _1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (async_utils_1_1) {
                async_utils_1 = async_utils_1_1;
            }],
        execute: function() {
            describe('HttpRequest', function () {
                var initMultipartResponse;
                var initFormResponse;
                var initPostResponse;
                var initPostErrorResponse;
                var initGetResponse;
                var initGetErrorResponse;
                var SuccessFilter = (function () {
                    function SuccessFilter() {
                    }
                    SuccessFilter.prototype.filter = function (_a) {
                        var err = _a.err, res = _a.res;
                        return err ? { err: { result: err }, res: null } : { res: { result: res }, err: null };
                    };
                    return SuccessFilter;
                }());
                var ErrorFilter = (function () {
                    function ErrorFilter() {
                    }
                    ErrorFilter.prototype.filter = function (res) {
                        return false;
                    };
                    return ErrorFilter;
                }());
                var parseRequest = function (req) {
                    var ret = {};
                    _.forEach(req.split('&'), function (v) {
                        var splited = v.split('=');
                        var v1 = splited[0];
                        var v2 = splited[1];
                        ret[v1] = v2 === 'false' ? false : v2 === 'true' ? true : v2;
                    });
                    return ret;
                };
                var fetchCache = window.fetch;
                var server = { respond: function () { queue.forEach(function (_a) {
                        var resolve = _a.resolve, res = _a.res;
                        return resolve(res);
                    }); } };
                var queue = [];
                beforeEach(function () {
                    initPostResponse = function () {
                        window['fetch'] = function (url, opt) {
                            return new es6_promise_1.Promise(function (resolve) {
                                var body = opt.body;
                                var res = new window['Response'](body, {
                                    status: 200,
                                    headers: {
                                        'Content-type': 'application/json'
                                    }
                                });
                                queue.push({ resolve: resolve, res: res });
                            });
                        };
                    };
                    initPostErrorResponse = function () {
                        window['fetch'] = function (url, opt) {
                            return new es6_promise_1.Promise(function (_, reject) { return queue.push({ resolve: reject, res: new window['Response'](opt.body, {
                                    status: 400,
                                    headers: {
                                        'Content-type': 'application/json'
                                    }
                                }) }); });
                        };
                    };
                    initFormResponse = function () {
                        window['fetch'] = function (url, opt) {
                            return new es6_promise_1.Promise(function (resolve) { return queue.push({ resolve: resolve, res: new window['Response'](opt.body, {
                                    status: 200,
                                    headers: {
                                        'Content-type': 'application/json'
                                    }
                                }) }); });
                        };
                    };
                    initGetResponse = function (params) {
                        window['fetch'] = function (url, opt) {
                            return new es6_promise_1.Promise(function (resolve) { return queue.push({ resolve: resolve, res: new window['Response']('{"success": true}', {
                                    status: 200,
                                    headers: {
                                        'Content-type': 'application/json'
                                    }
                                }) }); });
                        };
                    };
                    initGetErrorResponse = function () {
                        window['fetch'] = function (url, opt) {
                            return new es6_promise_1.Promise(function (_, reject) { return queue.push({ resolve: reject, res: new window['Response']('{"success": false}', {
                                    status: 400,
                                    headers: {
                                        'Content-type': 'application/json'
                                    }
                                }) }); });
                        };
                    };
                });
                var httpRequest = null;
                afterEach(function () {
                    window['fetch'] = fetchCache;
                    queue.length = 0;
                    httpRequest && httpRequest.end();
                    httpRequest = null;
                });
                var waitRequest = function (opt, inst) {
                    var subject = new rx_1.Subject();
                    inst.wait(subject);
                    subject.onNext(opt);
                };
                var init = function (filters) {
                    var ret = httpRequest = new http_1.HttpRquest(filters);
                    return ret;
                };
                describe('HttpRequest#get()', function () {
                    it('getリクエストを送信する(200)', function (done) {
                        initGetResponse();
                        var request = init([]);
                        request.response.for('test').subscribe(async_utils_1.graceful(function (v) {
                            chai_1.expect(v).to.be.deep.equal({ success: true });
                        }, done));
                        waitRequest({ url: '/test/ok', key: 'test', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                    });
                    it('getリクエストを送信する(200,パラメータ付き)', function (done) {
                        initGetResponse('test=1');
                        var request = init([]);
                        request.response.for('test').subscribe(async_utils_1.graceful(function (res) {
                            chai_1.expect(res).to.be.deep.equal({ success: true });
                        }, done));
                        waitRequest({ url: '/test/ok', data: { test: 1 }, key: 'test', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                    });
                    it('getリクエストを送信する(400)', function (done) {
                        initGetErrorResponse();
                        var request = init([]);
                        request.response.for('test').subscribe(function () { }, async_utils_1.graceful(function (res) {
                            chai_1.expect(res).to.be.deep.equal({ success: false });
                        }, done));
                        waitRequest({ url: '/test/ng', key: 'test', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                    });
                    it('filterをかける(200)', function (done) {
                        initGetResponse();
                        var request = init([new SuccessFilter()]);
                        request.response.for('test').subscribe(async_utils_1.graceful(function (res) {
                            chai_1.expect(res).to.be.deep.equal({ result: { success: true } });
                        }, done));
                        waitRequest({ url: '/test/ok', key: 'test', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                    });
                    it('filterをかける(400)', function (done) {
                        initGetErrorResponse();
                        var request = init([new SuccessFilter()]);
                        request.response.for('test').subscribe(function () { }, async_utils_1.graceful(function (res) {
                            chai_1.expect(res).to.be.deep.equal({ result: { success: false } });
                        }, done));
                        waitRequest({ url: '/test/ng', key: 'test', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                    });
                    it('filterで処理をとめる(200)', function () {
                        var called = false;
                        initGetResponse();
                        var request = init([new ErrorFilter()]);
                        request.response.for('test').subscribe(function (res) { called = true; });
                        waitRequest({ url: '/test/ok', key: 'test', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                        chai_1.expect(called).to.be.false;
                    });
                    it('filterで処理をとめる(400)', function () {
                        var called = false;
                        initGetErrorResponse();
                        var request = init([new ErrorFilter()]);
                        request.response.for('test').subscribe(function () { }, function (res) { called = true; });
                        waitRequest({ url: '/test/ng', key: 'test', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                        chai_1.expect(called).to.be.false;
                    });
                });
                describe('HttpRequest#post()', function () {
                    it('postリクエストを送信する(200)', function (done) {
                        initPostResponse();
                        var request = init([]);
                        request.response.for('test-post').subscribe(async_utils_1.graceful(function (res) {
                            chai_1.expect(res).to.be.deep.equal({ success: true });
                        }, done));
                        waitRequest({ url: '/test/ok', data: { success: true }, method: http_1.HttpMethod.POST, key: 'test-post', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                    });
                    it('postリクエストを送信する(200, form)', function (done) {
                        initFormResponse();
                        var request = init([]);
                        request.response.for('test-post').subscribe(async_utils_1.graceful(function (res) {
                            chai_1.expect(res).to.be.deep.equal({ success: true });
                        }, done));
                        waitRequest({ url: '/test/ok', data: { success: true }, form: true, method: http_1.HttpMethod.POST, key: 'test-post', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                    });
                    it('postリクエストを送信する(400)', function (done) {
                        initPostErrorResponse();
                        var request = init([]);
                        request.response.for('test-post').subscribe(function () { }, async_utils_1.graceful(function (res) {
                            chai_1.expect(res).to.be.deep.equal({ success: false });
                        }, done));
                        waitRequest({ url: '/test/ng', data: { success: false }, method: http_1.HttpMethod.POST, key: 'test-post', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                    });
                    it('filterをかける(200)', function (done) {
                        initPostResponse();
                        var request = init([new SuccessFilter()]);
                        request.response.for('test-post').subscribe(async_utils_1.graceful(function (res) {
                            chai_1.expect(res).to.be.deep.equal({ result: { success: true } });
                        }, done));
                        waitRequest({ url: '/test/ok', data: { success: true }, method: http_1.HttpMethod.POST, key: 'test-post', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                    });
                    it('filterをかける(400)', function (done) {
                        initPostErrorResponse();
                        var request = init([new SuccessFilter()]);
                        request.response.for('test-post').subscribe(function () { }, async_utils_1.graceful(function (res) {
                            chai_1.expect(res).to.be.deep.equal({ result: { success: false } });
                        }, done));
                        waitRequest({ url: '/test/ng', data: { success: false }, method: http_1.HttpMethod.POST, key: 'test-post', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                    });
                    it('filterで処理をとめる(200)', function () {
                        var called = false;
                        initPostResponse();
                        var request = init([new ErrorFilter()]);
                        request.response.for('test-post').subscribe(function (res) { called = true; });
                        waitRequest({ url: '/test/ok', data: { success: true }, method: http_1.HttpMethod.POST, key: 'test-post', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                        chai_1.expect(called).to.be.false;
                    });
                    it('filterで処理をとめる(400)', function () {
                        var called = false;
                        initPostErrorResponse();
                        var request = init([new ErrorFilter()]);
                        request.response.for('test-post').subscribe(function () { }, function (res) { called = true; });
                        waitRequest({ url: '/test/ng', data: { success: true }, method: http_1.HttpMethod.POST, key: 'test-post', responseType: http_1.ResponseType.JSON }, request);
                        server.respond();
                        chai_1.expect(called).to.be.false;
                    });
                });
            });
        }
    }
});
