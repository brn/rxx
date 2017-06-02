"use strict";
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var PropTypes = require("prop-types");
var Rx_1 = require("rxjs/Rx");
var injector_1 = require("../di/injector");
var io_1 = require("../io/io");
var service_1 = require("../service/service");
var utils_1 = require("../utils");
/**
 * React contextTypes.
 */
exports.ContextReactTypes = {
    createProps: PropTypes.func,
    clean: PropTypes.func,
    connect: PropTypes.func,
    injector: PropTypes.object,
    io: PropTypes.object
};
var isEnumerable = function (v) {
    if (!v || typeof v !== 'object') {
        return false;
    }
    if (Object.getPrototypeOf) {
        if (Object.getPrototypeOf(v) !== Object.prototype) {
            return false;
        }
    }
    else {
        if (v.constructor && v.constructor !== Object) {
            return false;
        }
    }
    return true;
};
/**
 * Call connect method of the ConnectableObservable for all properties of props.
 * @param v The value to search
 */
var connect = function (v) {
    if (!v) {
        return;
    }
    if (v instanceof Rx_1.ConnectableObservable) {
        return v.connect && v.connect();
    }
    if (!isEnumerable(v)) {
        return;
    }
    utils_1.forIn(v, function (v, k) {
        if (!v) {
            return;
        }
        if (v instanceof Rx_1.ConnectableObservable && v.connect) {
            v.connect();
        }
        else if (utils_1.isArray(v)) {
            v.forEach(connect);
        }
        else if (utils_1.isObject(v)) {
            if (!isEnumerable(v)) {
                return;
            }
            utils_1.forIn(v, connect);
        }
    });
};
/**
 * React context provider.
 */
var Context = (function (_super) {
    __extends(Context, _super);
    function Context(props, c) {
        var _this = _super.call(this, props, c) || this;
        var self = _this;
        var injector = props.injector ? props.injector : new injector_1.Injector(props.modules);
        var subscription = new Rx_1.Subscription();
        var ioModules = utils_1.mapValues(injector.find(function (binding) {
            if (!binding.instance && binding.val) {
                return binding.val[io_1.IO_MARK];
            }
            else if (binding.instance) {
                return binding.instance[io_1.IO_MARK];
            }
        }), function (v, k) { return injector.get(k); });
        var services = utils_1.map(injector.find(function (binding) {
            if (binding.val) {
                return !!binding.val[service_1.SERVICE_MARK];
            }
        }), function (v, k) { return injector.get(k); });
        _this.contextObject = {
            createProps: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var ioResposens = utils_1.mapValues(ioModules, function (v) { return v ? v.response : null; });
                return services.reduce(function (props, service) {
                    var result;
                    if (typeof service.initialize !== 'function') {
                        result = service.apply(void 0, [ioResposens, injector].concat(args));
                    }
                    else {
                        result = service.initialize.apply(service, [ioResposens, injector].concat(args));
                    }
                    utils_1.forIn(ioModules, function (io) { return subscription.add(io.subscribe(result)); });
                    return utils_1.assign(props, result['view'] || {});
                }, {});
            },
            clean: function () {
                subscription.unsubscribe();
            },
            connect: connect,
            injector: injector,
            io: ioModules
        };
        return _this;
    }
    Context.prototype.render = function () {
        return this.props.children;
    };
    Context.prototype.componentWillUnmount = function () {
        this.contextObject.clean();
    };
    Context.prototype.getChildContext = function () {
        return this.contextObject;
    };
    Object.defineProperty(Context, "childContextTypes", {
        get: function () {
            return exports.ContextReactTypes;
        },
        enumerable: true,
        configurable: true
    });
    return Context;
}(React.Component));
exports.Context = Context;
/**
 * Decorator to set specified type as context type.
 * @param target A class constructor.
 */
function context(target) {
    target['contextTypes'] = exports.ContextReactTypes;
}
exports.context = context;
/**
 * Set context type to stateless component.
 * @param component A stateless component.
 */
function setContext(component) {
    component['contextTypes'] = exports.ContextReactTypes;
}
exports.setContext = setContext;
