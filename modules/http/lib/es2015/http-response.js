// -*- mode: typescript -*-
/**
 * @fileoverview
 * @author Taketoshi Aono
 */
export var HttpResponseImpl = (function () {
    function HttpResponseImpl(_ok, _status, _headers, _response, _error) {
        if (_error === void 0) { _error = null; }
        this._ok = _ok;
        this._status = _status;
        this._headers = _headers;
        this._response = _response;
        this._error = _error;
    }
    Object.defineProperty(HttpResponseImpl.prototype, "ok", {
        get: function () { return this._ok; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpResponseImpl.prototype, "headers", {
        get: function () { return this._headers; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpResponseImpl.prototype, "status", {
        get: function () { return this._status; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpResponseImpl.prototype, "response", {
        get: function () { return this._response; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpResponseImpl.prototype, "error", {
        get: function () { return this._error; },
        enumerable: true,
        configurable: true
    });
    return HttpResponseImpl;
}());
