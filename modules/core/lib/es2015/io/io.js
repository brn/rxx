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
import { Subject } from 'rxjs/Subject';
import { Symbol } from '../shims/symbol';
import { _ } from '../shims/lodash';
export const IO_MARK = Symbol('io');
/**
 * Base class of io module.
 */
export class IOModule {
    constructor() {
        this[IO_MARK] = true;
    }
}
/**
 * Decorator for io module.
 */
export function io(target) {
    target[IO_MARK] = true;
}
const IO_MODULES = ['http', 'event', 'storage'];
export const appendIOModuleKey = (name) => {
    if (IO_MODULES.indexOf(name) === -1) {
        IO_MODULES.push(name);
        return;
    }
    throw new Error(`${name} is already registered as io module.`);
};
export const getIOModules = () => IO_MODULES.slice();
/**
 * Represent IO response.
 */
export class IOResponse {
    constructor(subjectStore) {
        this.subjectStore = subjectStore;
    }
    ;
    /**
     * Get a subject by specify key.
     * @param key Subject name.
     * @returns Registered Subject.
     */
    for(key) {
        if (!this.subjectStore.hasWithoutGlobal(key)) {
            return this.subjectStore.add(key);
        }
        return this.subjectStore.getWithoutGlobal(key);
    }
}
/**
 * Hold Subject cache.
 */
export class SubjectStore {
    constructor(subjectMap = {}) {
        this.subjectMap = subjectMap;
    }
    hasWithoutGlobal(key) {
        return !!this.subjectMap[key];
    }
    /**
     * Check whether Subject was defined with specific key or not.
     * @param key Subject name.
     * @return True if Subject was defined.
     */
    has(key) {
        const splited = key.split('::');
        const globalKey = splited.length > 1 ? `*::${splited[1]}` : null;
        return this.subjectMap[key] || (globalKey ? this.subjectMap[globalKey] : false);
    }
    getWithoutGlobal(key) {
        if (this.subjectMap[key]) {
            return this.subjectMap[key];
        }
        return null;
    }
    /**
     * Get Subject by specific key.
     * @param key Subject name.
     * @returns Registered Subject.
     */
    get(key) {
        const ret = [];
        const splited = key.split('::');
        const globalKey = splited.length > 1 ? `*::${splited[1]}` : null;
        const globalBus = globalKey && this.subjectMap[globalKey] ? this.subjectMap[globalKey] : null;
        if (this.subjectMap[key]) {
            ret.push(this.subjectMap[key]);
        }
        if (globalBus) {
            ret.push(globalBus);
        }
        return ret;
    }
    /**
     * Append new Subject.
     * @param key Subject name.
     * @returns Registered Subject.
     */
    add(key) {
        return this.subjectMap[key] = new Subject();
    }
    /**
     * Dispose all subscriptions.
     */
    end() {
        _.forEach(this.subjectMap, (v) => v.complete());
    }
}
/**
 * The methods of the Http request.
 */
export var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 1] = "GET";
    HttpMethod[HttpMethod["POST"] = 2] = "POST";
    HttpMethod[HttpMethod["PUT"] = 3] = "PUT";
})(HttpMethod || (HttpMethod = {}));
/**
 * Response type of the Http request.
 */
export var ResponseType;
(function (ResponseType) {
    ResponseType[ResponseType["JSON"] = 1] = "JSON";
    ResponseType[ResponseType["BLOB"] = 2] = "BLOB";
    ResponseType[ResponseType["ARRAY_BUFFER"] = 3] = "ARRAY_BUFFER";
    ResponseType[ResponseType["FORM_DATA"] = 4] = "FORM_DATA";
    ResponseType[ResponseType["TEXT"] = 5] = "TEXT";
})(ResponseType || (ResponseType = {}));
/**
 * The methods of the StorageIO.
 */
export var StorageMethod;
(function (StorageMethod) {
    StorageMethod[StorageMethod["PUT"] = 1] = "PUT";
    StorageMethod[StorageMethod["GET"] = 2] = "GET";
    StorageMethod[StorageMethod["DEL"] = 3] = "DEL";
})(StorageMethod || (StorageMethod = {}));
/**
 * The type of the Storage.
 */
export var StorageType;
(function (StorageType) {
    StorageType[StorageType["LOCAL_STORAGE"] = 1] = "LOCAL_STORAGE";
    StorageType[StorageType["SESSION_STORAGE"] = 2] = "SESSION_STORAGE";
    StorageType[StorageType["COOKIE"] = 3] = "COOKIE";
})(StorageType || (StorageType = {}));
;
