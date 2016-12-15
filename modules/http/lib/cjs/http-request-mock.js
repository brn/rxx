/**
 * @fileoverview IOのモッククラス定義
 * @author Taketoshi Aono
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var promise_1 = require("./shims/promise");
var http_request_1 = require("./http-request");
var fetch_1 = require("./shims/fetch");
/**
 * Mock class for HttpRequest.
 */
var HttpRequestMock = (function (_super) {
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
exports.HttpRequestMock = HttpRequestMock;
