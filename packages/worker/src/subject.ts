/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import { Subject, Observable } from 'rxjs';
import { share } from 'rxjs/operators';

export interface SubjectPayload<Type extends string, Payload, States = {}> {
  type: Type;
  states: States;
  payload: Payload;
  dispatch(key: string, args: any): void;
}

const MAX_HISTORY_LENGTH = 10;

export class SubjectTree {
  private subject = new Subject<SubjectPayload<string, any, any>>();
  private state: any = { view: {} };
  private preservation: { type: string; payload: any }[] = [];
  private shouldImmediateDispatch = true;
  private lastDispatched: { type: string; payload: any } | null = null;
  private histories: SubjectPayload<string, any, any>[] = [];
  private subscribers: ((a: { type: string; payload: any }) => void)[] = [];

  public setState(state: any) {
    this.state = state;
  }

  public subscribe(callback: (a: { type: string; payload: any }) => void) {
    this.subscribers.push(callback);
  }

  public unsubscribe(callback) {
    this.subscribers = this.subscribers.filter(s => s !== callback);
  }

  public unsubscribeAll() {
    this.subscribers = [];
  }

  public notify<Payload>(payload: { type: string; payload: Payload }) {
    this.shouldImmediateDispatch = false;

    if (payload.type === 'RETRY') {
      const target = payload.payload
        ? this.findHistory(payload.payload as any)
        : this.histories[this.histories.length - 1];

      if (target) {
        this.doNotify(target);
        this.notifySubscribers(target);
      }

      return;
    }

    this.doNotify(this.createSubjectPayload(payload));
  }

  public get observable(): Observable<any> {
    return this.subject.pipe(share());
  }

  public getLastDispatched() {
    return this.lastDispatched;
  }

  private notifySubscribers(payload: { type: string; payload: any }) {
    this.subscribers.forEach(a => a(payload));
  }

  private doNotify<Payload>(payload: SubjectPayload<string, Payload, any>) {
    this.histories.push(payload);
    if (this.histories.length >= MAX_HISTORY_LENGTH) {
      this.histories.shift();
    }
    this.lastDispatched = payload;
    this.subject.next(payload);
    if (this.preservation.length) {
      const preservations = this.preservation.slice();
      this.preservation.length = 0;
      preservations.forEach(preserved => this.notify(preserved));
    }
    this.shouldImmediateDispatch = true;
  }

  private findHistory(retryKey: string) {
    return this.histories.filter(({ type }) => type === retryKey)[0] || null;
  }

  private createSubjectPayload(payload: { type: string; payload: any }) {
    return {
      ...payload,
      states: this.state.view,
      dispatch: (type, payload) => {
        if (this.shouldImmediateDispatch) {
          this.notify({ type, payload });
        } else {
          this.preservation.push({ type, payload });
        }
      },
    };
  }
}
