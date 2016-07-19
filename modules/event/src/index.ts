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

import {
  io,
  IOResponse,
  SubjectStore,
  Event,
  isDefined,
  Outlet
} from '@react-mvi/core';
import {
  Subscription
} from 'rxjs/Rx';


/**
 * History size.
 */
const MAX_HISTORY_LENGTH = 10;


/**
 * Event publisher.
 */
@io
export class EventDispatcher extends Outlet {
  /**
   * Event history.
   */
  private history = [];


  public subscribe(props: {[key: string]: any}): Subscription {
    return new Subscription();
  }


  /**
   * Publish event.
   * @override
   * @param key Event name. If 'RETRY' passed, past published event will be republishing.
   * @param args Event args. If a first argument was 'RETRY', specify history index.
   * If empty, last event will be publishing.
   */
  public fire(key: string, args?: any): void {
    if (key === 'RETRY') {
      const target = this.history[args || this.history.length - 1];
      if (target) {
        target();
      }
      return;
    }
    if (!this.store.has(key)) {
      return;
    }
    const subjects = this.store.get(key);
    const fire = () => subjects.forEach(subject => subject.next(args));
    this.history.push(fire);
    if (this.history.length > MAX_HISTORY_LENGTH) {
      this.history.shift();
    }
    fire();
  }


  /**
   * Fire event after specific time.
   * @override
   * @param time Time to delay.
   * @param key Event name.
   * @param args Event args.
   */
  public throttle(time: number, key: string, args?: any): void {
    setTimeout(() => {
      this.fire(key, args);
    }, time);
  }


  /**
   * Return callback function that will publish event.
   * @override
   * @param key Event name.
   * @param v Event args. Override publish args.
   */
  public asCallback(key: string, v?: any): (args?: any) => void {
    return (args?: any) => this.fire(key, isDefined(v)? v: args);
  }


  /**
   * Same as asCallback.
   * @override
   * @param key Event name.
   * @param v Event args.
   */
  public asc(key: string, v?: any): (args?: any) => void {
    return this.asCallback(key, v);
  }
}
