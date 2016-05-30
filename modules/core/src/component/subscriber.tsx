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


export class Subscriber extends React.Component<any, any> {
  private subscription: Subscription;

  private observableMap = [];

  constructor(p, c) {
    super(p, c);
    this.state = {
      vdom: null
    };
  }


  public render() {
    return this.state.vdom;
  }


  public componentWillMount() {
    this.findObservable(this.props.children);
    this.subscribe();
  }


  public componentWillReceiveProps(nextProps) {
    this.subscription && this.subscription.unsubscribe();
    this.observableMap = [];
    this.findObservable(nextProps.children);
    this.subscribe();
  }


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
            this.observableMap.push(v);
          }
        });

        if (child.props.children) {
          this.findObservable(child.props.children);
        }

      } else if (child instanceof Observable) {
        this.observableMap.push(child);
      }
    });
  }


  private subscribe() {
    if (this.observableMap.length) {
      this.subscription = Observable.combineLatest(...this.observableMap).subscribe(values => {
        const vdom = this.createNewChildren(<div>{this.props.children}</div>, values || []);
        this.renderVdom(vdom);
      });
    } else {
      this.renderVdom(this.props.children);
    }
  }


  private renderVdom(vdom: React.ReactElement<any>|React.ReactElement<any>[]) {
    this.setState({vdom});
  }


  private createNewChildren(el, observableValues) {
    const target = el.props? (_.isArray(el.props.children)? el.props.children: el.props.children? [el.props.children]: []): [];
    const children = _.map(target, (child: React.ReactElement<any>, i) => {
      if (child instanceof Observable) {
        return this.findObservableFromMap(child, observableValues);
      } else if (React.isValidElement(child) && !this.isObserverified(child)) {
        return this.createNewChildren(child, observableValues);
      }
      return child;
    });
    const props = _.mapValues(_.omit(el.props, 'children'), (v: React.ReactElement<any>, k: string) => {
      if (v instanceof Observable) {
        return this.findObservableFromMap(v, observableValues);
      }
      return v;
    });
    return React.cloneElement(el, props, ...children);
  }


  private findObservableFromMap(observable, observableValues) {
    const index = this.observableMap.indexOf(observable);
    if (index > -1) {
      return observableValues[index];
    }
    return null;
  }


  public componentWillUnmount() {
    this.subscription && this.subscription.unsubscribe();
  }


  private isObserverified(child: React.ReactElement<any>): boolean {
    return child.type && child.type === Subscriber;
  }
}
