// -*- mode: typescript -*-
/**
 * @fileoverview
 * @author Taketoshi Aono
 */
export var HttpResponse = (function () {
    function HttpResponse(_ok, _status, _response, _error) {
        if (_error === void 0) { _error = null; }
        this._ok = _ok;
        this._status = _status;
        this._response = _response;
        this._error = _error;
    }
    Object.defineProperty(HttpResponse.prototype, "ok", {
        get: function () { return this._ok; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpResponse.prototype, "status", {
        get: function () { return this._status; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpResponse.prototype, "response", {
        get: function () { return this._response; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpResponse.prototype, "error", {
        get: function () { return this._error; },
        enumerable: true,
        configurable: true
    });
    return HttpResponse;
}());
