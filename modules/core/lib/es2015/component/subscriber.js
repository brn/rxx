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
import { Observable } from 'rxjs/Rx';
import { getProcess } from '../env';
import { Symbol } from '../shims/symbol';
import { _ } from '../shims/lodash';
const process = getProcess();
/**
 * Steal $$typeof symbol from dummy element.
 */
const REACT_ELEMENT_TYPEOF = React.createElement('div', {})['$$typeof'];
/**
 * If this symbol was set to static property,
 * that mean this component is process Observable.
 */
export const SUBSCRIBER_MARK = Symbol('__react_mvi_subscriber__');
/**
 * Information about embedded observables and ReactElement.
 */
class ObservableBinding {
    constructor(updater, _observable) {
        this.updater = updater;
        this._observable = _observable;
    }
    /**
     * Return Observable that flow BindingObservableType.
     */
    observable() { return this._observable.map(value => ({ value, binding: this })); }
    /**
     * Update target element props or child.
     */
    update(value) {
        this.updater(value);
    }
}
/**
 * Identity function to return children.
 */
const EmptyRoot = props => props.children;
/**
 * Subscriber component for Rx.Observable.
 * This component provide an ability that subscribe rxjs stream props by auto detection of children components.
 */
export class Subscriber extends React.Component {
    constructor(p, c) {
        super(p, c);
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
        // State has virtual dom tree that are covered by this component.
        this.state = {
            vdom: null
        };
    }
    /**
     * Rendering new vdom trees that
     * props are replaced by result value of observable.
     */
    render() {
        return this.state.vdom;
    }
    /**
     * Subscribe all observable that embeded in vdom trees.
     */
    componentWillMount() {
        this.mutableTree = this.cloneChildren(React.createElement(EmptyRoot, null, this.props.children), null, null);
        this.subscribeAll();
    }
    /**
     * Reset all subscriptions and re subscribe all observables.
     */
    componentWillReceiveProps(nextProps) {
        this.disposeAll();
        this.mutableTree = this.cloneChildren(React.createElement(EmptyRoot, null, this.props.children), null, null);
        this.subscribeAll();
    }
    /**
     * Subscribe changes of observables.
     * If observable was updated, children components are updated and rerendered.
     */
    subscribeAll() {
        if (this.bindings.length > 0) {
            const bindings = _.map(this.bindings, binding => binding.observable());
            this.subscription = Observable.combineLatest(...bindings).subscribe((bindings) => {
                _.forEach(bindings, ({ value, binding }) => binding.update(value));
                this.setState({ vdom: this.createMutableElement(this.mutableTree) });
            });
        }
        else {
            this.setState({ vdom: this.props.children });
        }
    }
    /**
     * Reset all subscriptions.
     */
    componentWillUnmount() {
        this.disposeAll();
    }
    /**
     * Dispose all subscriptions and clear bindings.
     */
    disposeAll() {
        this.subscription && this.subscription.unsubscribe();
        this.subscription = null;
        this.bindings = [];
    }
    /**
     * Update children elements.
     * @param el A parent ReactElement.
     */
    updateChildren(el, value, index) {
        if (el.props.children && _.isArray(el.props.children)) {
            if (_.isArray(value) && _.every(value, v => v['$$typeof'] === REACT_ELEMENT_TYPEOF)) {
                el.props.children = el.props.children.slice(0, index).concat(value);
            }
            else {
                el.props.children[index] = value;
            }
            if (process.env.NODE_ENV === 'debug') {
                // Check valid element or not
                React.createElement(el.type, el.props, ...el.props.children);
            }
        }
        else {
            el.props.children = value;
            if (process.env.NODE_ENV === 'debug') {
                // Check valid element or not
                React.createElement(el.type, el.props, el.props.children);
            }
        }
    }
    /**
     * Create mutable ReactElement trees.
     * @param el A source ReactElement.
     * @returns Mutable ReactElement like json.
     */
    createMutableElement(el) {
        return {
            $$typeof: REACT_ELEMENT_TYPEOF,
            type: el.type,
            props: _.clone(el.props),
            ref: el['ref'],
            key: el.key,
            _owner: el['_owner']
        };
    }
    /**
     * Clone all children trees that has mutable props, mutable children, recursively from root.
     * @param el Root React.ReactElement.
     */
    cloneChildren(el, parent, index) {
        const newElement = this.createMutableElement(el);
        const target = newElement.props.children ? (!_.isArray(newElement.props.children) ? [newElement.props.children] : newElement.props.children) : [];
        const children = _.map(target, (child, i) => {
            if (child instanceof Observable) {
                this.bindings.push(new ObservableBinding(value => {
                    this.updateChildren(newElement, value, i);
                    this.updateElement(parent, newElement, index);
                }, child));
            }
            else if (React.isValidElement(child) && !this.isSubscriber(child)) {
                return this.cloneChildren(child, newElement, i);
            }
            return child;
        });
        _.forEach(_.omit(newElement.props, 'children'), (v, k) => {
            if (v instanceof Observable) {
                this.bindings.push(new ObservableBinding(value => {
                    newElement.props[k] = value;
                    this.updateElement(parent, newElement, index);
                }, v));
            }
        });
        if (newElement.props.children) {
            if (_.isArray(newElement.props.children)) {
                newElement.props.children = children;
            }
            else {
                newElement.props.children = children[0];
            }
        }
        return newElement;
    }
    /**
     * Update ReactElement to force update state of React Element Tree.
     * @param parent Parent ReactElement of current updated ReactElement.
     * @param el Updated ReactElement.
     */
    updateElement(parent, el, index) {
        if (parent) {
            this.updateChildren(parent, this.createMutableElement(el), index);
        }
        else {
            this.mutableTree = this.createMutableElement(this.mutableTree);
        }
    }
    /**
     * Check whether child is Subscriber or not.
     * @param child Child to check.
     * @returns Return true is passed element type is Subscriber constructor or has SUBSCRIBER_MARK.
     */
    isSubscriber(child) {
        return child.type && (child.type === Subscriber || child.type[SUBSCRIBER_MARK]);
    }
}
