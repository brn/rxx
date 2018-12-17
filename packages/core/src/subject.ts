/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import { Subject, Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { ReduxDevTools } from './devtools';

export interface SubjectPayload<Type extends string, Payload, States = {}> {
  type: Type;
  states: States;
  payload: Payload;
  dispatch(key: string, args: any): void;
}

const MAX_HISTORY_LENGTH = 10;

export class SubjectTree {
  private children: SubjectTree[] = [];
  private subject = new Subject<SubjectPayload<string, any, any>>();
  private state: any = { view: {} };
  private preservation: { type: string; payload: any }[] = [];
  private shouldImmediateDispatch = true;
  private lastDispatched: { type: string; payload: any } | null = null;
  private histories: SubjectPayload<string, any, any>[] = [];
  private devtoolsEnabled = true;

  public constructor(
    private devTools: ReduxDevTools,
    private parent?: SubjectTree,
  ) {
    this.parent && this.parent.addChild(this);
  }

  public setState(state: any) {
    this.state = state;
  }

  public addChild(subjectTree: SubjectTree) {
    this.children.push(subjectTree);
  }

  public notify<Payload>(payload: { type: string; payload: Payload }) {
    this.shouldImmediateDispatch = false;

    if (payload.type === 'RETRY') {
      const target = payload.payload
        ? this.findHistory(payload.payload as any)
        : this.histories[this.histories.length - 1];

      if (target) {
        this.doNotify(target);
      }

      return;
    }

    this.doNotify(this.createSubjectPayload(payload));
  }

  public prepare(parent) {
    this.parent = parent;
  }

  public get observable(): Observable<any> {
    return this.subject.pipe(share());
  }

  public getLastDispatched() {
    return this.lastDispatched;
  }

  public suspendDevtools() {
    this.devtoolsEnabled = false;
  }

  public resumeDevtools() {
    this.devtoolsEnabled = true;
  }

  private doNotify<Payload>(payload: SubjectPayload<string, Payload, any>) {
    if (this.devtoolsEnabled) {
      const args = { type: payload.type, payload: payload.payload };
      this.devTools.send(args, {
        ...this.state.view,
        __payload__: args,
      });
    }
    this.histories.push(payload);
    if (this.histories.length >= MAX_HISTORY_LENGTH) {
      this.histories.shift();
    }
    this.lastDispatched = payload;
    this.subject.next(payload);
    this.children.forEach(child =>
      child.notify({ type: payload.type, payload: payload.payload }),
    );
    if (this.preservation.length) {
      const preservations = this.preservation.slice();
      this.preservation.length = 0;
      preservations.forEach(preserved => this.notify(preserved));
    }
    this.shouldImmediateDispatch = true;
  }

  private findHistory(retryKey: string) {
    let history =
      this.histories.filter(({ type }) => type === retryKey)[0] || null;
    if (!history && this.children.length) {
      this.children.some(child => {
        history = child.findHistory(retryKey);
        return !!history;
      });
    }

    return history;
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
