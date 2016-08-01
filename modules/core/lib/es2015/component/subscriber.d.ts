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
/**
 * If this symbol was set to static property,
 * that mean this component is process Observable.
 */
export declare const SUBSCRIBER_MARK: symbol;
/**
 * Subscriber component for Rx.Observable.
 * This component provide an ability that subscribe rxjs stream props by auto detection of children components.
 */
export declare class Subscriber extends React.Component<any, any> {
    /**
     * All subscriptions that are subscribed observable embeded in virtual dom trees.
     */
    private subscription;
    /**
     * All Embeded Observable informations.
     */
    private bindings;
    /**
     * Observable list that is pushed observable embeded in virtual dom trees.
     */
    private observableList;
    /**
     * Cloned mutable children tree.
     */
    private mutableTree;
    private hasObservable;
    constructor(p: any, c: any);
    /**
     * Rendering new vdom trees that
     * props are replaced by result value of observable.
     */
    render(): any;
    /**
     * Subscribe all observable that embeded in vdom trees.
     */
    componentWillMount(): void;
    /**
     * Reset all subscriptions and re subscribe all observables.
     */
    componentWillReceiveProps(nextProps: any): void;
    /**
     * Subscribe changes of observables.
     * If observable was updated, children components are updated and rerendered.
     */
    private subscribeAll();
    /**
     * Reset all subscriptions.
     */
    componentWillUnmount(): void;
    /**
     * Dispose all subscriptions and clear bindings.
     */
    private disposeAll();
    /**
     * Update children elements.
     * @param el A parent ReactElement.
     */
    private updateChildren(el, value, index);
    /**
     * Create mutable ReactElement trees.
     * @param el A source ReactElement.
     * @returns Mutable ReactElement like json.
     */
    private createMutableElement(el);
    /**
     * Clone all children trees that has mutable props, mutable children, recursively from root.
     * @param el Root React.ReactElement.
     */
    private areThereObservableInChildren(el);
    /**
     * Clone all children trees that has mutable props, mutable children, recursively from root.
     * @param el Root React.ReactElement.
     */
    private cloneChildren(el, parent, index);
    /**
     * Update ReactElement to force update state of React Element Tree.
     * @param parent Parent ReactElement of current updated ReactElement.
     * @param el Updated ReactElement.
     */
    private updateElement(parent, el, index);
    /**
     * Check whether child is Subscriber or not.
     * @param child Child to check.
     * @returns Return true is passed element type is Subscriber constructor or has SUBSCRIBER_MARK.
     */
    private isSubscriber(child);
}
