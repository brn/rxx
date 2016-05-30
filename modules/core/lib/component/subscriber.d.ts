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
 * Subscriber component for Rx.Observable.
 * This component provide an ability that subscribe rxjs stream props by auto detection of children components.
 */
export declare class Subscriber extends React.Component<any, any> {
    /**
     * All subscriptions that are subscribed observable embeded in virtual dom trees.
     */
    private subscription;
    /**
     * Observable list that is pushed observable embeded in virtual dom trees.
     */
    private observableList;
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
     * Find observables which are embded in props or text.
     */
    private findObservable(oldChildren?);
    /**
     * Subscribe changes of observables.
     * If observable was updated, children components are updated and rerendered.
     */
    private subscribe();
    /**
     * Rendering children virtual dom tree.
     * @param vdom New children vdom tree.
     */
    private renderVdom(vdom);
    /**
     * Create clone of children recursively.
     * @param el Child element to clone.
     * @param observableValues Result value of observables.
     */
    private createNewChildren(el, observableValues);
    /**
     * Find a value of observable from observable list.
     * @param observable Target observable.
     * @param obsrvableValues Result value list of observable.
     */
    private findObservableFromList(observable, observableValues);
    /**
     * Reset all subscriptions.
     */
    componentWillUnmount(): void;
    /**
     * Check whether child is Subscriber or not.
     * @param child Child to check.
     */
    private isObserverified(child);
}
