/**
 * @fileoverview IOのモッククラス定義
 * @author Taketoshi Aono
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Promise } from './shims/promise';
import { HttpRequest } from './http-request';
import { Response } from './shims/fetch';
/**
 * Mock class for HttpRequest.
 */
export var HttpRequestMock = (function (_super) {
    __extends(HttpRequestMock, _super);
    /**
     * @param methods Definitions of each method return value.
     */
    function HttpRequestMock(methods) {
        var _this = this;
        _super.call(this);
        this.methods = methods;
        this.fetchFunction = function (url, request) {
            return new Promise(function (resolve, reject) {
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
                    resolve(new Response(request.body, { status: 200, statusText: 'OK' }));
                }, 100);
            });
        };
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
}(HttpRequest));
