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
System.register(['react', 'rxjs/Rx', '../env', '../utils', '../shims/symbol', '../shims/lodash'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React, Rx_1, env_1, utils_1, symbol_1, lodash_1;
    var process, REACT_ELEMENT_TYPEOF, SUBSCRIBER_MARK, ObservableBinding, EmptyRoot, Subscriber;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (Rx_1_1) {
                Rx_1 = Rx_1_1;
            },
            function (env_1_1) {
                env_1 = env_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (symbol_1_1) {
                symbol_1 = symbol_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            process = env_1.getProcess();
            /**
             * Steal $$typeof symbol from dummy element.
             */
            REACT_ELEMENT_TYPEOF = React.createElement('div', {})['$$typeof'];
            /**
             * If this symbol was set to static property,
             * that mean this component is process Observable.
             */
            exports_1("SUBSCRIBER_MARK", SUBSCRIBER_MARK = symbol_1.Symbol('__react_mvi_subscriber__'));
            /**
             * Information about embedded observables and ReactElement.
             */
            ObservableBinding = (function () {
                function ObservableBinding(updater, _observable) {
                    this.updater = updater;
                    this._observable = _observable;
                }
                /**
                 * Return Observable that flow BindingObservableType.
                 */
                ObservableBinding.prototype.observable = function () {
                    var _this = this;
                    return this._observable.map(function (value) { return ({ value: value, binding: _this }); });
                };
                /**
                 * Update target element props or child.
                 */
                ObservableBinding.prototype.update = function (value) {
                    this.updater(value);
                };
                return ObservableBinding;
            }());
            /**
             * Identity function to return children.
             */
            EmptyRoot = function (props) { return props.children; };
            /**
             * Subscriber component for Rx.Observable.
             * This component provide an ability that subscribe rxjs stream props by auto detection of children components.
             */
            Subscriber = (function (_super) {
                __extends(Subscriber, _super);
                function Subscriber(p, c) {
                    _super.call(this, p, c);
                    /**
                     * All Embeded Observable informations.
                     */
                    this.bindings = [];
                    /**
                     * Observable list that is pushed observable embeded in virtual dom trees.
                     */
                    this.observableList = [];
                    /**
                     * Cloned mutable children tree.
                     */
                    this.mutableTree = null;
                    this.hasObservable = false;
                    this.hasObservable = this.areThereObservableInChildren(React.createElement(EmptyRoot, null, this.props.children));
                    // State has virtual dom tree that are covered by this component.
                    this.state = {
                        vdom: this.hasObservable ? null : this.props.children
                    };
                }
                /**
                 * Rendering new vdom trees that
                 * props are replaced by result value of observable.
                 */
                Subscriber.prototype.render = function () {
                    return this.state.vdom;
                };
                /**
                 * Subscribe all observable that embeded in vdom trees.
                 */
                Subscriber.prototype.componentWillMount = function () {
                    if (this.hasObservable) {
                        this.mutableTree = this.cloneChildren(React.createElement(EmptyRoot, null, this.props.children), null, null);
                        this.subscribeAll();
                    }
                };
                /**
                 * Reset all subscriptions and re subscribe all observables.
                 */
                Subscriber.prototype.componentWillReceiveProps = function (nextProps) {
                    this.disposeAll();
                    this.hasObservable = this.areThereObservableInChildren(React.createElement(EmptyRoot, null, nextProps.children));
                    if (this.hasObservable) {
                        this.mutableTree = this.cloneChildren(React.createElement(EmptyRoot, null, nextProps.children), null, null);
                        this.subscribeAll();
                    }
                    else {
                        this.setState({ vdom: nextProps.children });
                    }
                };
                /**
                 * Subscribe changes of observables.
                 * If observable was updated, children components are updated and rerendered.
                 */
                Subscriber.prototype.subscribeAll = function () {
                    var _this = this;
                    if (this.bindings.length > 0) {
                        var bindings = lodash_1._.map(this.bindings, function (binding) { return binding.observable(); });
                        this.subscription = Rx_1.Observable.combineLatest.apply(Rx_1.Observable, bindings).subscribe(function (bindings) {
                            lodash_1._.forEach(bindings, function (_a) {
                                var value = _a.value, binding = _a.binding;
                                return binding.update(value);
                            });
                            _this.setState({ vdom: _this.createMutableElement(_this.mutableTree) });
                        });
                    }
                    else {
                        this.setState({ vdom: this.props.children });
                    }
                };
                /**
                 * Reset all subscriptions.
                 */
                Subscriber.prototype.componentWillUnmount = function () {
                    this.disposeAll();
                };
                /**
                 * Dispose all subscriptions and clear bindings.
                 */
                Subscriber.prototype.disposeAll = function () {
                    this.subscription && this.subscription.unsubscribe();
                    this.subscription = null;
                    this.bindings = [];
                };
                /**
                 * Update children elements.
                 * @param el A parent ReactElement.
                 */
                Subscriber.prototype.updateChildren = function (el, value, index) {
                    if (el.props.children && lodash_1._.isArray(el.props.children)) {
                        if (lodash_1._.isArray(value)) {
                            el.props.children = el.props.children.slice(0, index).concat(value);
                        }
                        else {
                            el.props.children[index] = value;
                        }
                        if (process.env.NODE_ENV === 'debug') {
                            // Check valid element or not
                            React.createElement.apply(React, [el.type, el.props].concat(el.props.children));
                        }
                    }
                    else {
                        el.props.children = value;
                        if (process.env.NODE_ENV === 'debug') {
                            // Check valid element or not
                            React.createElement(el.type, el.props, el.props.children);
                        }
                    }
                };
                /**
                 * Create mutable ReactElement trees.
                 * @param el A source ReactElement.
                 * @returns Mutable ReactElement like json.
                 */
                Subscriber.prototype.createMutableElement = function (el) {
                    return {
                        $$typeof: REACT_ELEMENT_TYPEOF,
                        type: el.type,
                        props: lodash_1._.clone(el.props),
                        ref: el['ref'],
                        key: el.key,
                        _owner: el['_owner']
                    };
                };
                /**
                 * Clone all children trees that has mutable props, mutable children, recursively from root.
                 * @param el Root React.ReactElement.
                 */
                Subscriber.prototype.areThereObservableInChildren = function (el) {
                    var _this = this;
                    var target = lodash_1._.filter(el.props ? (el.props.children ? (!lodash_1._.isArray(el.props.children) ? [el.props.children] : el.props.children) : []) : [], function (v) { return utils_1.isDefined(v); });
                    return lodash_1._.some(target, function (child, i) {
                        if (child instanceof Rx_1.Observable) {
                            return true;
                        }
                        return _this.areThereObservableInChildren(child);
                    }) || lodash_1._.some(lodash_1._.omit(el.props, 'children'), function (v, k) {
                        return v instanceof Rx_1.Observable;
                    });
                };
                /**
                 * Clone all children trees that has mutable props, mutable children, recursively from root.
                 * @param el Root React.ReactElement.
                 */
                Subscriber.prototype.cloneChildren = function (el, parent, index) {
                    var _this = this;
                    var newElement = this.createMutableElement(el);
                    var target = lodash_1._.filter(newElement.props.children ? (!lodash_1._.isArray(newElement.props.children) ? [newElement.props.children] : newElement.props.children) : [], function (v) { return utils_1.isDefined(v); });
                    var children = lodash_1._.map(target, function (child, i) {
                        if (child instanceof Rx_1.Observable) {
                            _this.bindings.push(new ObservableBinding(function (value) {
                                _this.updateChildren(newElement, value, i);
                                _this.updateElement(parent, newElement, index);
                            }, child));
                        }
                        else if (React.isValidElement(child) && !_this.isSubscriber(child)) {
                            return _this.cloneChildren(child, newElement, i);
                        }
                        return child;
                    });
                    lodash_1._.forEach(lodash_1._.omit(newElement.props, 'children'), function (v, k) {
                        if (v instanceof Rx_1.Observable) {
                            _this.bindings.push(new ObservableBinding(function (value) {
                                newElement.props[k] = value;
                                _this.updateElement(parent, newElement, index);
                            }, v));
                        }
                    });
                    if (newElement.props.children) {
                        if (lodash_1._.isArray(newElement.props.children)) {
                            newElement.props.children = children;
                        }
                        else {
                            newElement.props.children = children[0];
                        }
                    }
                    return newElement;
                };
                /**
                 * Update ReactElement to force update state of React Element Tree.
                 * @param parent Parent ReactElement of current updated ReactElement.
                 * @param el Updated ReactElement.
                 */
                Subscriber.prototype.updateElement = function (parent, el, index) {
                    if (parent) {
                        this.updateChildren(parent, this.createMutableElement(el), index);
                    }
                    else {
                        this.mutableTree = this.createMutableElement(this.mutableTree);
                    }
                };
                /**
                 * Check whether child is Subscriber or not.
                 * @param child Child to check.
                 * @returns Return true is passed element type is Subscriber constructor or has SUBSCRIBER_MARK.
                 */
                Subscriber.prototype.isSubscriber = function (child) {
                    return child.type && (child.type === Subscriber || child.type[SUBSCRIBER_MARK]);
                };
                return Subscriber;
            }(React.Component));
            exports_1("Subscriber", Subscriber);
        }
    }
});
