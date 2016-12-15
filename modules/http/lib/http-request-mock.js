/**
 * @fileoverview IOのモッククラス定義
 * @author Taketoshi Aono
 */
System.register(["./shims/promise", "./http-request", "./shims/fetch"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var __moduleName = context_1 && context_1.id;
    var promise_1, http_request_1, fetch_1, HttpRequestMock;
    return {
        setters: [
            function (promise_1_1) {
                promise_1 = promise_1_1;
            },
            function (http_request_1_1) {
                http_request_1 = http_request_1_1;
            },
            function (fetch_1_1) {
                fetch_1 = fetch_1_1;
            }
        ],
        execute: function () {/**
             * @fileoverview IOのモッククラス定義
             * @author Taketoshi Aono
             */
            /**
             * Mock class for HttpRequest.
             */
            HttpRequestMock = (function (_super) {
                __extends(HttpRequestMock, _super);
                /**
                 * @param methods Definitions of each method return value.
                 */
                function HttpRequestMock(methods) {
                    var _this = _super.call(this) || this;
                    _this.methods = methods;
                    _this.fetchFunction = function (url, request) {
                        return new promise_1.Promise(function (resolve, reject) {
                            setTimeout(function () {
                                var method = _this.methods[(request.method || 'get').toLowerCase()];
                                if (typeof method === 'function') {
                                    var fn = method;
                                    try {
                                        return resolve(fn(url, request));
                                    }
                                    catch (e) {
                                        return reject(e);
                                    }
                                }
                                resolve(new fetch_1.Response(request.body, { status: 200, statusText: 'OK' }));
                            }, 100);
                        });
                    };
                    return _this;
                }
                Object.defineProperty(HttpRequestMock.prototype, "fetch", {
                    /**
                     * Return whatwgFetch function mock.
                     */
                    get: function () {
                        return this.fetchFunction;
                    },
                    enumerable: true,
                    configurable: true
                });
                return HttpRequestMock;
            }(http_request_1.HttpRequest));
            exports_1("HttpRequestMock", HttpRequestMock);
        }
    };
});
