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
System.register(['lodash', 'react', 'rx', '../di/injector'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var _, React, rx_1, injector_1;
    var ContextReactTypes, connect, Context, MVIRootComponent, MVISubtreeComponent;
    return {
        setters:[
            function (_1) {
                _ = _1;
            },
            function (React_1) {
                React = React_1;
            },
            function (rx_1_1) {
                rx_1 = rx_1_1;
            },
            function (injector_1_1) {
                injector_1 = injector_1_1;
            }],
        execute: function() {
            /**
             * React contextTypes.
             */
            exports_1("ContextReactTypes", ContextReactTypes = {
                injector: React.PropTypes.instanceOf(injector_1.default),
                event: React.PropTypes.object,
                http: React.PropTypes.object,
                storage: React.PropTypes.object,
                makeService: React.PropTypes.func,
                clean: React.PropTypes.func,
                connect: React.PropTypes.func
            });
            /**
             * Call connect method of the ConnectableObservable for all properties of props.
             */
            connect = function (v, k) {
                if (rx_1.Observable.isObservable(v)) {
                    return v.connect && v.connect();
                }
                if (v.isIterable && v.isIterable()) {
                    return v;
                }
                _.forIn(v, function (v, k) {
                    if (rx_1.Observable.isObservable(v) && v.connect) {
                        v.connect();
                    }
                    else if (v.isIterable && v.isIterable()) {
                        return v;
                    }
                    else if (_.isArray(v)) {
                        v.forEach(v, connect);
                    }
                    else if (_.isObject(v)) {
                        _.forIn(v, connect);
                    }
                });
            };
            /**
             * Context component.
             */
            Context = (function (_super) {
                __extends(Context, _super);
                function Context(p, c) {
                    _super.call(this, p, c);
                    this.contextObject = {
                        injector: this.props.injector,
                        event: this.props.injector.get('event'),
                        http: this.props.injector.get('http'),
                        storage: this.props.injector.get('storage'),
                        makeService: function (service) {
                            var _this = this;
                            var args = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                args[_i - 1] = arguments[_i];
                            }
                            var props = service.apply(void 0, [{ http: this.http.response, event: this.event.response }].concat(args));
                            if ('http' in props) {
                                _.forIn(props['http'], function (v) { return _this.http.wait(v); });
                            }
                            return props;
                        },
                        clean: function () {
                            this.event.end();
                            this.http.end();
                        },
                        connect: connect
                    };
                }
                Context.prototype.render = function () {
                    return this.props.children;
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
                Context.propTypes = {
                    injector: React.PropTypes.instanceOf(injector_1.default)
                };
                return Context;
            }(React.Component));
            exports_1("Context", Context);
            MVIRootComponent = (function (_super) {
                __extends(MVIRootComponent, _super);
                function MVIRootComponent() {
                    _super.apply(this, arguments);
                }
                MVIRootComponent.prototype.componentWillUnmount = function () {
                    this.context.clean();
                };
                MVIRootComponent.prototype.makeService = function (service) {
                    return this.context.makeService(service);
                };
                MVIRootComponent.prototype.connect = function (v) {
                    this.context.connect(v);
                };
                MVIRootComponent.contextTypes = ContextReactTypes;
                return MVIRootComponent;
            }(React.Component));
            exports_1("MVIRootComponent", MVIRootComponent);
            MVISubtreeComponent = (function (_super) {
                __extends(MVISubtreeComponent, _super);
                function MVISubtreeComponent() {
                    _super.apply(this, arguments);
                }
                MVISubtreeComponent.contextTypes = ContextReactTypes;
                return MVISubtreeComponent;
            }(React.Component));
            exports_1("MVISubtreeComponent", MVISubtreeComponent);
        }
    }
});
