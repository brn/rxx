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
import * as React from 'react';
import { ConnectableObservable } from 'rxjs/Rx';
import { Injector } from '../di/injector';
import { getIOModules } from '../io/io';
import { _ } from '../shims/lodash';
/**
 * React contextTypes.
 */
export const ContextReactTypes = {
    createProps: React.PropTypes.func,
    clean: React.PropTypes.func,
    connect: React.PropTypes.func,
    injector: React.PropTypes.object,
    io: React.PropTypes.object
};
/**
 * Check param is immutablejs object or not.
 */
const isImmutable = v => v['isIterable'] && v['isIterable']();
/**
 * Call connect method of the ConnectableObservable for all properties of props.
 */
const connect = (v, k) => {
    if (!v) {
        return;
    }
    if (v instanceof ConnectableObservable) {
        return v.connect && v.connect();
    }
    if (isImmutable(v)) {
        return v;
    }
    if (Object.getPrototypeOf(v) !== Object.prototype) {
        return;
    }
    _.forIn(v, (v, k) => {
        if (!v) {
            return;
        }
        if (v instanceof ConnectableObservable && v.connect) {
            v.connect();
        }
        else if (isImmutable(v)) {
            return v;
        }
        else if (_.isArray(v)) {
            v.forEach(connect);
        }
        else if (_.isObject(v)) {
            if (Object.getPrototypeOf(v) !== Object.prototype) {
                return;
            }
            _.forIn(v, connect);
        }
    });
};
/**
 * @class
 */
export class Context extends React.Component {
    constructor(props, c) {
        super(props, c);
        const self = this;
        const injector = new Injector(props.modules);
        const ioModules = {};
        getIOModules().map(k => ioModules[k] = injector.get(k));
        const services = injector.get(/Service$/);
        this.contextObject = {
            createProps(...args) {
                const ioResposens = _.mapValues(ioModules, v => v ? v.response : null);
                return services.reduce((props, service) => {
                    let result;
                    if (typeof service.initialize !== 'function') {
                        result = service(ioResposens, injector, ...args);
                    }
                    else {
                        result = service.initialize();
                    }
                    if ('http' in result && ioModules['http']) {
                        _.forIn(result['http'], (v) => ioModules['http'].wait(v));
                    }
                    return _.assign(props, result);
                }, {});
            },
            clean() {
                _.forIn(ioModules, io => io.end());
            },
            connect,
            injector: injector,
            io: ioModules
        };
    }
    render() {
        return this.props.children;
    }
    getChildContext() {
        return this.contextObject;
    }
    static get childContextTypes() {
        return ContextReactTypes;
    }
}
/**
 * Decorator to set specified type as context type.
 */
export function context(target) {
    target['contextTypes'] = ContextReactTypes;
}
export function setContext(component) {
    component['contextTypes'] = ContextReactTypes;
}
