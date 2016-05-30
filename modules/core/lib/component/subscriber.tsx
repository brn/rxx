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
import * as _ from 'lodash';
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  IO_MARK
} from '../io/io';


/**
 * Subscriber component for Rx.Observable.
 * This component provide an ability that subscribe rxjs stream props by auto detection of children components.
 */
export class Subscriber extends React.Component<any, any> {
  /**
   * All subscriptions that are subscribed observable embeded in virtual dom trees.
   */
  private subscription: Subscription;

  /**
   * Observable list that is pushed observable embeded in virtual dom trees.
   */
  private observableList = [];


  constructor(p, c) {
    super(p, c);
    // State has virtual dom tree that are covered by this component.
    this.state = {
      vdom: null
    };
  }


  /**
   * Rendering new vdom trees that
   * props are replaced by result value of observable.
   */
  public render() {
    return this.state.vdom;
  }


  /**
   * Subscribe all observable that embeded in vdom trees.
   */
  public componentWillMount() {
    this.findObservable(this.props.children);
    this.subscribe();
  }


  /**
   * Reset all subscriptions and re subscribe all observables.
   */
  public componentWillReceiveProps(nextProps) {
    this.subscription && this.subscription.unsubscribe();
    this.observableList = [];
    this.findObservable(nextProps.children);
    this.subscribe();
  }


  /**
   * Find observables which are embded in props or text.
   */
  private findObservable(oldChildren = []) {
    const children = !_.isArray(oldChildren)? [oldChildren]: oldChildren;
    _.forEach(children, (child: React.ReactElement<any>, index) => {
      if (child.type === Subscriber) {
        return;
      }

      if (child.props) {
        const props = [];
        _.forIn(_.omit(child.props, 'children'), (v, k) => {
          if (v instanceof Observable) {
            this.observableList.push(v);
          }
        });

        if (child.props.children) {
          this.findObservable(child.props.children);
        }

      } else if (child instanceof Observable) {
        this.observableList.push(child);
      }
    });
  }


  /**
   * Subscribe changes of observables.
   * If observable was updated, children components are updated and rerendered.
   */
  private subscribe() {
    if (this.observableList.length) {
      this.subscription = Observable.combineLatest(...this.observableList).subscribe((values: any[]) => {
        const vdom = this.createNewChildren(<div>{this.props.children}</div>, values || []);
        this.renderVdom(vdom);
      });
    } else {
      this.renderVdom(this.props.children);
    }
  }


  /**
   * Rendering children virtual dom tree.
   * @param vdom New children vdom tree.
   */
  private renderVdom(vdom: React.ReactElement<any>|React.ReactElement<any>[]) {
    this.setState({vdom});
  }


  /**
   * Create clone of children recursively.
   * @param el Child element to clone.
   * @param observableValues Result value of observables.
   */
  private createNewChildren(el: React.ReactElement<any>, observableValues: any[]) {
    const target = el.props? (_.isArray(el.props.children)? el.props.children: el.props.children? [el.props.children]: []): [];
    const children = _.map(target, (child: React.ReactElement<any>, i) => {
      if (child instanceof Observable) {
        return this.findObservableFromList(child as any, observableValues);
      } else if (React.isValidElement(child) && !this.isObserverified(child)) {
        return this.createNewChildren(child, observableValues);
      }
      return child;
    });
    const props = _.mapValues(_.omit(el.props, 'children'), (v: React.ReactElement<any>, k: string) => {
      if (v instanceof Observable) {
        return this.findObservableFromList(v, observableValues);
      }
      return v;
    });
    return React.cloneElement(el, props, ...children);
  }


  /**
   * Find a value of observable from observable list.
   * @param observable Target observable.
   * @param obsrvableValues Result value list of observable.
   */
  private findObservableFromList(observable: Observable<any>, observableValues: any[]) {
    const index = this.observableList.indexOf(observable);
    if (index > -1) {
      return observableValues[index];
    }
    return null;
  }


  /**
   * Reset all subscriptions.
   */
  public componentWillUnmount() {
    this.subscription && this.subscription.unsubscribe();
  }


  /**
   * Check whether child is Subscriber or not.
   * @param child Child to check.
   */
  private isObserverified(child: React.ReactElement<any>): boolean {
    return child.type && child.type === Subscriber;
  }
}
