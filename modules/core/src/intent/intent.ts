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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */

import { StateHandler } from '../handler/state-handler';
import { HandlerResponse, StreamStore } from '../handler/handler';
import { isDefined, assign } from '../utils';
import { Subscription } from 'rxjs';
import { SubjectTree } from '../subject';

/**
 * History size.
 */
const MAX_HISTORY_LENGTH = 10;

/**
 * User defined Intent instance.
 */
export interface IntentClass {}

/**
 * User defined Intent class constructor.
 */
export interface IntentConstructor {
  new (
    dispatch: (type: string, payload: any) => void,
    handlers: { [key: string]: HandlerResponse },
  ): IntentClass;
}

/**
 * Intent decorator that assign StateHandler to instance properties.
 */
export function intent<T extends IntentConstructor>(Base: T) {
  function EnhancedIntent(dispatch, handlers) {
    this.dispatch = dispatch;
    for (const key in handlers) {
      this[key] = handlers[key];
    }
    Base.call(this, handlers);
  }
  EnhancedIntent.prototype = Base.prototype;

  return EnhancedIntent as any;
}

/**
 * Singleton event publisher.
 */
export class Intent extends StateHandler {
  /**
   * Event history.
   */
  private history: { key: string; fire(): void }[] = [];

  private children: Intent[] = [];

  private parent: Intent;

  constructor(parent?: Intent) {
    super();
    this.prepare(parent);
  }

  private addChild(child: Intent) {
    this.children.push(child);
  }

  private removeChild(intent: Intent) {
    const index = this.children.indexOf(intent);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  public dispose() {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this.children = [];
    this.parent = null;
  }

  public prepare(parent?: Intent) {
    this.parent = parent;
    if (this.parent) {
      this.parent.addChild(this);
    }
  }

  public subscribe(props: { [key: string]: any }): Subscription {
    return new Subscription();
  }

  public clone(...args: any[]) {
    return this;
  }

  /**
   * Publish event.
   * @override
   * @param key Event name. If 'RETRY' passed, past published event will be republishing.
   * @param args Event args. If a first argument was 'RETRY', specify history index.
   * If empty, last event will be publishing.
   */
  public push(key: string, args?: any): Promise<any> {
    if (key === 'RETRY') {
      const target = args
        ? this.findHistory(args)
        : this.history[this.history.length - 1];
      if (target) {
        target.fire();
      }

      return;
    }
    const subjects = this.findSubjects(key);
    if (!subjects.length) {
      return;
    }

    const fire = () => {
      subjects.forEach(subject =>
        subject.next({ data: args, state: this.state }),
      );
    };
    this.history.push({ fire, key });
    if (this.history.length > MAX_HISTORY_LENGTH) {
      this.history.shift();
    }
    fire();

    return Promise.resolve();
  }

  public getStreamStore() {
    return this.store;
  }

  /**
   * Return callback function that will publish event.
   * @override
   * @param key Event name.
   * @param v Event args. Override publish args.
   */
  public callback<Args = any, ReturnType = any>(
    key: string,
    v?: any,
  ): (args?: Args) => Promise<ReturnType> {
    return (args?: any) => this.push(key, isDefined(v) ? v : args);
  }

  private findSubjects(key: string) {
    let subjects = this.store.get(key);
    if (this.parent) {
      subjects = subjects.concat(this.findParentSubjects(key, false));
    }
    if (this.children.length) {
      subjects = subjects.concat(this.findChildrenSubjects(key, false));
    }

    return subjects;
  }

  private findParentSubjects(key: string, searchSelfStore = true) {
    const subjects = searchSelfStore ? this.store.get(key) : [];
    if (this.parent) {
      return subjects.concat(this.parent.findParentSubjects(key));
    }

    return subjects;
  }

  private findChildrenSubjects(key: string, searchSelfStore = true) {
    const subjects = searchSelfStore ? this.store.get(key) : [];
    if (this.children.length) {
      return this.children.reduce(
        (subject, child) => subjects.concat(child.findChildrenSubjects(key)),
        subjects,
      );
    }

    return subjects;
  }

  private findHistory(retryKey: string) {
    let history = this.history.filter(({ key }) => key === retryKey)[0];
    if (!history && this.parent) {
      history = this.findParentHistory(retryKey, false);
    }
    if (!history && this.children.length) {
      history = this.findChildrenHistory(retryKey, false);
    }

    return history;
  }

  private findParentHistory(retryKey: string, searchSelfStore = true) {
    const history = searchSelfStore
      ? this.history.filter(({ key }) => key === retryKey)[0]
      : null;

    if (!history && this.parent) {
      return this.parent.findParentHistory(retryKey);
    }

    return history;
  }

  private findChildrenHistory(retryKey: string, searchSelfStore = true) {
    const history = searchSelfStore
      ? this.history.filter(({ key }) => key === retryKey)[0]
      : null;
    if (!history && this.children.length) {
      let found: typeof history;
      this.children.some(child => {
        found = child.findChildrenHistory(retryKey);
        if (found) {
          return true;
        }
        return false;
      });
      return found;
    }

    return history;
  }
}
