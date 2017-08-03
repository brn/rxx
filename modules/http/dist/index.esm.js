import { StateHandler, isDefined } from '@react-mvi/core';
import { ConnectableObservable, Subject, Subscription } from 'rxjs/Rx';

/**
 * @fileoverview
 * @author Taketoshi Aono
 */
/**
 * The methods of the Http request.
 */
var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 1] = "GET";
    HttpMethod[HttpMethod["POST"] = 2] = "POST";
    HttpMethod[HttpMethod["PUT"] = 3] = "PUT";
    HttpMethod[HttpMethod["DELETE"] = 4] = "DELETE";
})(HttpMethod || (HttpMethod = {}));
/**
 * Response type of the Http request.
 */
var ResponseType;
(function (ResponseType) {
    ResponseType[ResponseType["JSON"] = 1] = "JSON";
    ResponseType[ResponseType["BLOB"] = 2] = "BLOB";
    ResponseType[ResponseType["ARRAY_BUFFER"] = 3] = "ARRAY_BUFFER";
    ResponseType[ResponseType["FORM_DATA"] = 4] = "FORM_DATA";
    ResponseType[ResponseType["TEXT"] = 5] = "TEXT";
    ResponseType[ResponseType["STREAM"] = 6] = "STREAM";
})(ResponseType || (ResponseType = {}));
var UploadEventType;
(function (UploadEventType) {
    UploadEventType[UploadEventType["PROGRESS"] = 1] = "PROGRESS";
    UploadEventType[UploadEventType["ERROR"] = 2] = "ERROR";
    UploadEventType[UploadEventType["ABORT"] = 3] = "ABORT";
    UploadEventType[UploadEventType["COMPLETE"] = 4] = "COMPLETE";
})(UploadEventType || (UploadEventType = {}));
var ResponseObjectType;
(function (ResponseObjectType) {
    ResponseObjectType[ResponseObjectType["RESPONSE"] = 1] = "RESPONSE";
    ResponseObjectType[ResponseObjectType["UPLOAD_PROGRESS"] = 2] = "UPLOAD_PROGRESS";
})(ResponseObjectType || (ResponseObjectType = {}));
function ____$_react_mvi_module_reference_bug_fix__dummy_$____() { }

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 *  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
class HttpResponseImpl {
    constructor(_ok, _status, _headers, _response, _error = null) {
        this._ok = _ok;
        this._status = _status;
        this._headers = _headers;
        this._response = _response;
        this._error = _error;
        this.type = ResponseObjectType.RESPONSE;
    }
    get ok() { return this._ok; }
    get headers() { return this._headers; }
    get status() { return this._status; }
    get response() { return this._response; }
    get error() { return this._error; }
}
class HttpUploadProgressImpl {
    constructor(event, xhr) {
        this.event = event;
        this.xhr = xhr;
        this.type = ResponseObjectType.UPLOAD_PROGRESS;
    }
    get percent() {
        return this.event.loaded / this.event.total;
    }
    get total() {
        return this.event.total;
    }
    get loaded() {
        return this.event.loaded;
    }
    cancel() {
        this.xhr.abort();
    }
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
const TYPE_MATCHER = /\[object ([^\]]+)\]/;
const TO_STRING = Object.prototype.toString;
/**
 * Convert object to query string.
 * @param data Data that need to convert to query string.
 * @param Query string.
 */
function qs(data) {
    const ret = [];
    serialize(data, ret);
    return ret.join('&');
}
/**
 * Get constructor type from any object.
 * @param value Object which want to inspect constructor type.
 */
function getType(value) {
    return TO_STRING.call(value).match(TYPE_MATCHER)[1];
}
/**
 * Push query string to resultCollection.
 * @param data Value that want to convert to query string.
 * @param resultCollection Serialized object store.
 * @param parentKey ParentObject key if current data is object.
 */
function serialize(data, resultCollection, parentKey = '') {
    const type = getType(data);
    if (type === 'Object') {
        for (const key in data) {
            const valueType = getType(data[key]);
            const keyValue = `${parentKey ? `${parentKey}.` : ''}${key}`;
            if (valueType === 'String' ||
                valueType === 'Number' ||
                valueType === 'RegExp' ||
                valueType === 'Boolean') {
                resultCollection.push(`${encodeURIComponent(keyValue)}=${encodeURIComponent(data[key])}`);
            }
            else if (valueType === 'Date') {
                resultCollection.push(`${encodeURIComponent(keyValue)}=${encodeURIComponent(String(+(data[key])))}`);
            }
            else if (valueType === 'Object') {
                serialize(data[key], resultCollection, key);
            }
            else if (valueType === 'Array') {
                serialize(data[key], resultCollection, key);
            }
        }
    }
    else if (type === 'Array') {
        for (let i = 0, len = data.length; i < len; i++) {
            resultCollection.push(`${encodeURIComponent(parentKey[i])}=${encodeURIComponent(data[i])}`);
        }
    }
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 *  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const DEFAULT_ERROR_STATUS = 500;
/**
 * Http request sender.
 */
class HttpHandler extends StateHandler {
    constructor(a) {
        super(a, {
            request: ['get', 'post', 'put', 'delete', 'upload'],
            response: 'getResponse'
        });
        this.history = [];
    }
    static set maxHistoryLength(length) {
        this._maxHistoryLength = length;
    }
    static get maxHistoryLenght() { return this._maxHistoryLength; }
    /**
     * Wait for request from observables.
     * @override
     * @param request Observable that send request.
     */
    subscribe(props) {
        const subscription = new Subscription();
        if (props.http) {
            for (const reqKey in props.http) {
                const req = props.http[reqKey];
                subscription.add(req.subscribe((config) => this.push(reqKey, config)));
            }
            for (const reqKey in props.http) {
                const req = props.http[reqKey];
                if (req instanceof ConnectableObservable || typeof req.connect === 'function') {
                    req.connect();
                }
            }
        }
        return subscription;
    }
    /**
     * @inheritDoc
     */
    push(key, args) {
        if (key === 'RETRY') {
            const history = this.history[this.history.length - (typeof args === 'number' ? (args + 1) : 1)];
            if (!history) {
                return new Promise((_, r) => r(new Error('Invlaid retry number specified.')));
            }
            key = history.key;
            args = history.args;
        }
        else {
            if (this.history.length > HttpHandler._maxHistoryLength) {
                this.history.shift();
            }
            this.history.push({ key, args });
        }
        if (!args) {
            return new Promise((_, r) => r(new Error('Config required.')));
        }
        const config = args;
        if (!config.reduce) {
            config.reduce = v => v;
        }
        const subjects = this.store.get(key);
        if (config.upload) {
            return this.upload(config).then(subject => {
                this.handleUploadResonse(subjects, subject, config);
            });
        }
        const errorHandler = (err, result) => {
            const response = new HttpResponseImpl(false, err && err.status ? err.status : DEFAULT_ERROR_STATUS, {}, null, result);
            subjects.forEach(subject => subject.next(config.reduce({ data: response, state: this.state })));
        };
        const succeededHandler = (response, result) => {
            const headers = this.processHeaders(response);
            const httpResponse = new HttpResponseImpl(response.ok, response.status, headers, response.ok ? result : null, response.ok ? null : result);
            subjects.forEach(subject => subject.next(config.reduce({ data: httpResponse, state: this.state })));
        };
        return this.handleResponse(config, succeededHandler, errorHandler);
    }
    handleUploadResonse(subjects, subject, config) {
        const sub = subject.subscribe(e => {
            if (e.type !== UploadEventType.PROGRESS) {
                sub.unsubscribe();
                const isComplete = e.type !== UploadEventType.COMPLETE;
                const contentType = e.xhr.getResponseHeader('Content-Type') || '';
                const response = config.responseType === ResponseType.JSON
                    || contentType.indexOf('application/json') > -1 ? JSON.parse(e.xhr.responseText) : e.xhr.responseText;
                const headers = e.xhr.getAllResponseHeaders();
                const headerArr = headers.split('\n');
                const headerMap = {};
                headerArr.forEach(e => {
                    const [key, value] = e.split(':');
                    if (key && value) {
                        headerMap[key.trim()] = value.trim();
                    }
                });
                subjects.forEach(subject => {
                    const httpResponse = new HttpResponseImpl(e.type === UploadEventType.COMPLETE, e.xhr.status, headerMap, isComplete ? response : null, isComplete ? null : response);
                    subject.next(config.reduce({ data: httpResponse, state: this.state }));
                });
            }
            else {
                subjects.forEach(subject => {
                    const httpResponse = new HttpUploadProgressImpl(e.event, e.xhr);
                    subject.next(config.reduce({ data: httpResponse, state: this.state }));
                });
            }
        });
    }
    handleResponse(config, succeededHandler, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield (() => {
                    switch (config.method) {
                        case HttpMethod.GET:
                            return this.get(config);
                        case HttpMethod.POST:
                            return this.post(config);
                        case HttpMethod.PUT:
                            return this.put(config);
                        case HttpMethod.DELETE:
                            return this.delete(config);
                        default:
                            return this.get(config);
                    }
                })();
                if (!res.ok) {
                    throw res;
                }
                // For IE|Edge
                if (!res.url) {
                    const u = 'ur' + 'l';
                    try {
                        res[u] = config.url;
                    }
                    catch (e) { }
                }
                const resp = this.getResponse(config.responseType, res);
                if (resp && resp.then) {
                    const ret = yield resp;
                    succeededHandler(res, ret);
                }
            }
            catch (err) {
                if (err && typeof err.json === 'function') {
                    const resp = this.getResponse(config.responseType, err);
                    if (resp && resp.then) {
                        try {
                            const e = yield resp;
                            errorHandler(err, e);
                        }
                        catch (e) {
                            errorHandler(err, e);
                        }
                    }
                }
                else {
                    errorHandler(err, err);
                }
            }
        });
    }
    processHeaders(res) {
        const headers = {};
        res.headers.forEach((v, k) => headers[k] = v);
        return headers;
    }
    getFetcher() {
        return fetch;
    }
    /**
     * Send GET request.
     * @data url Target url.
     * @data data GET parameters.
     * @returns Promise that return response.
     */
    get({ url, headers = {}, data = null, mode }) {
        return this.getFetcher()(data ? `${url}${qs(data)}` : url, {
            method: 'GET',
            headers,
            mode: mode || 'same-origin'
        });
    }
    /**
     * Send POST request.
     * @data url Target url.
     * @data data POST body.
     * @returns Promise that return response.
     */
    post({ url, headers = {}, data = {}, json = true, form = false, mode }) {
        return this.getFetcher()(url, {
            headers,
            method: 'POST',
            mode: mode || 'same-origin',
            body: json ? JSON.stringify(data) : form ? qs(data) : data
        });
    }
    /**
     * Send PUT request.
     * @data url Target url.
     * @data data PUT body.
     * @returns Promise that return response.
     */
    put({ url, headers = {}, data = {}, json = true, form = false, mode }) {
        return this.getFetcher()(url, {
            headers,
            method: 'PUT',
            mode: mode || 'same-origin',
            body: json ? JSON.stringify(data) : form ? qs(data) : data
        });
    }
    /**
     * Send DELETE request.
     * @data url Target url.
     * @data data PUT body.
     * @returns Promise that return response.
     */
    delete({ url, headers = {}, data = {}, json = true, form = false, mode }) {
        const req = {
            headers,
            method: 'DELETE',
            mode: mode || 'same-origin'
        };
        if (isDefined(data)) {
            req.body = json ? JSON.stringify(data) : form ? qs(data) : data;
        }
        return this.getFetcher()(url, req);
    }
    upload({ method, url, headers = {}, data = {}, mode }) {
        const xhr = new XMLHttpRequest();
        const subject = new Subject();
        const events = {};
        const addEvent = (xhr, type, fn, dispose = false) => {
            events[type] = e => {
                if (dispose) {
                    for (const key in events) {
                        xhr.removeEventListener(key, events[key]);
                    }
                }
                fn(e);
            };
            xhr.addEventListener(type, events[type], false);
        };
        if (xhr.upload) {
            addEvent(xhr.upload, 'progress', e => subject.next({ type: UploadEventType.PROGRESS, event: e, xhr }));
        }
        addEvent(xhr, 'error', e => subject.next({ type: UploadEventType.ERROR, event: e, xhr }), true);
        addEvent(xhr, 'abort', e => subject.next({ type: UploadEventType.ABORT, event: e, xhr }), true);
        addEvent(xhr, 'load', e => {
            if (!xhr.upload) {
                subject.next({ type: UploadEventType.PROGRESS, event: { total: 1, loaded: 1 }, xhr });
            }
            subject.next({ type: UploadEventType.COMPLETE, event: e, xhr });
        }, true);
        xhr.open(HttpMethod[method], url, true);
        for (const key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }
        xhr.send(data);
        return Promise.resolve(subject);
    }
    /**
     * Get proper response from fetch response body.
     * @param responseType The type of response. ex. ARRAY_BUFFER, BLOB, etc...
     * @param res Http response.
     * @returns
     */
    getResponse(responseType, res) {
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
                return Promise.resolve(res.body);
            default:
                return res.text();
        }
    }
    getResponseTypeFromHeader(res) {
        const mime = res.headers.get('content-type');
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
    }
}
HttpHandler._maxHistoryLength = 10;

/**
 * @fileoverview IOのモッククラス定義
 * @author Taketoshi Aono
 */
/**
 * Mock class for HttpRequest.
 */
class HttpHandlerMock extends HttpHandler {
    /**
     * @param methods Definitions of each method return value.
     */
    constructor(methods, advices) {
        super(advices);
        this.methods = methods;
        this.fetchFunction = (url, request) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const method = this.methods[(request.method || 'get').toLowerCase()];
                    if (typeof method === 'function') {
                        const fn = method;
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
    /**
     * Return whatwgFetch function mock.
     */
    get fetch() {
        return this.fetchFunction;
    }
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */

export { HttpMethod, ResponseType, UploadEventType, ResponseObjectType, ____$_react_mvi_module_reference_bug_fix__dummy_$____, HttpResponseImpl, HttpUploadProgressImpl, HttpHandler, HttpHandlerMock };
