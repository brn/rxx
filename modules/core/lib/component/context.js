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
System.register(['react', 'rxjs/Rx', '../di/injector', '../io/io', '../service/service', '../shims/lodash'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React, Rx_1, injector_1, io_1, service_1, lodash_1;
    var ContextReactTypes, isImmutable, isEnumerable, connect, Context;
    /**
     * Decorator to set specified type as context type.
     * @param target A class constructor.
     */
    function context(target) {
        target['contextTypes'] = ContextReactTypes;
    }
    exports_1("context", context);
    /**
     * Set context type to stateless component.
     * @param component A stateless component.
     */
    function setContext(component) {
        component['contextTypes'] = ContextReactTypes;
    }
    exports_1("setContext", setContext);
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (Rx_1_1) {
                Rx_1 = Rx_1_1;
            },
            function (injector_1_1) {
                injector_1 = injector_1_1;
            },
            function (io_1_1) {
                io_1 = io_1_1;
            },
            function (service_1_1) {
                service_1 = service_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            /**
             * React contextTypes.
             */
            exports_1("ContextReactTypes", ContextReactTypes = {
                createProps: React.PropTypes.func,
                clean: React.PropTypes.func,
                connect: React.PropTypes.func,
                injector: React.PropTypes.object,
                io: React.PropTypes.object
            });
            /**
             * Check param is immutablejs object or not.
             */
            isImmutable = function (v) { return v['isIterable'] && v['isIterable'](); };
            isEnumerable = function (v) {
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
            connect = function (v) {
                if (!v) {
                    return;
                }
                if (v instanceof Rx_1.ConnectableObservable) {
                    return v.connect && v.connect();
                }
                if (isImmutable(v)) {
                    return v;
                }
                if (!isEnumerable(v)) {
                    return;
                }
                lodash_1._.forIn(v, function (v, k) {
                    if (!v) {
                        return;
                    }
                    if (v instanceof Rx_1.ConnectableObservable && v.connect) {
                        v.connect();
                    }
                    else if (isImmutable(v)) {
                        return v;
                    }
                    else if (lodash_1._.isArray(v)) {
                        v.forEach(connect);
                    }
                    else if (lodash_1._.isObject(v)) {
                        if (!isEnumerable(v)) {
                            return;
                        }
                        lodash_1._.forIn(v, connect);
                    }
                });
            };
            /**
             * React context provider.
             */
            Context = (function (_super) {
                __extends(Context, _super);
                function Context(props, c) {
                    _super.call(this, props, c);
                    var self = this;
                    var injector = props.injector ? props.injector : new injector_1.Injector(props.modules);
                    var ioModules = lodash_1._.mapValues(injector.find(function (binding) {
                        if (!binding.instance && binding.val) {
                            return binding.val[io_1.IO_MARK];
                        }
                        else if (binding.instance) {
                            return binding.instance[io_1.IO_MARK];
                        }
                    }), function (v, k) { return injector.get(k); });
                    var services = lodash_1._.map(injector.find(function (binding) {
                        if (binding.val) {
                            return !!binding.val[service_1.SERVICE_MARK];
                        }
                        return;
                    }), function (v, k) { return injector.get(k); });
                    this.contextObject = {
                        createProps: function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i - 0] = arguments[_i];
                            }
                            var ioResposens = lodash_1._.mapValues(ioModules, function (v) { return v ? v.response : null; });
                            return services.reduce(function (props, service) {
                                var result;
                                if (typeof service.initialize !== 'function') {
                                    result = service.apply(void 0, [ioResposens, injector].concat(args));
                                }
                                else {
                                    result = service.initialize.apply(service, [ioResposens, injector].concat(args));
                                }
                                lodash_1._.forEach(ioModules, function (io) { return self.subscription.add(io.subscribe(result)); });
                                return lodash_1._.assign(props, result['view'] || {});
                            }, {});
                        },
                        clean: function () {
                            self.subscription.unsubscribe();
                        },
                        connect: connect,
                        injector: injector,
                        io: ioModules
                    };
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
                        return ContextReactTypes;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Context;
            }(React.Component));
            exports_1("Context", Context);
        }
    }
});
