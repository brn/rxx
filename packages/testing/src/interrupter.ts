/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import {
  SubjectTree,
  SubjectPayload,
  Provisioning,
  UnObservablify,
} from '@rxx/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export class Interrupter<S> {
  public observable = new Subject<UnObservablify<S>>();
  private publisher: ReturnType<Provisioning<any>['getSubject']>;

  constructor(private provisioning: Provisioning<any>) {
    this.provisioning.subscribe(state => {
      this.observable.next(state);
    });
    this.publisher = this.provisioning.getSubject();
  }

  public toObservable(
    { disposeWhenUnsubscribe }: { disposeWhenUnsubscribe: boolean } = {
      disposeWhenUnsubscribe: true,
    },
  ): Observable<UnObservablify<S>> {
    return Observable.create(subscriber => {
      const sub = this.observable.subscribe(v => subscriber.next(v));

      return () => {
        sub.unsubscribe();
        if (disposeWhenUnsubscribe) {
          this.provisioning.dispose();
        }
      };
    });
  }

  public send<T>(type: string, payload: any = {}): void {
    this.publisher.notify({ type, payload });
  }

  public subscribe(
    callback: (state: UnObservablify<S>) => void,
    runInitial = false,
  ): () => void {
    return this.provisioning.subscribe(callback, runInitial);
  }

  public dispose() {
    this.provisioning.dispose();
  }

  public wait<T extends string, P, S>(
    type: string,
  ): Promise<{ type: string; payload: any }> {
    return new Promise(resolve => {
      this.provisioning.subscribe(payload => resolve(payload));
    });
  }
}
