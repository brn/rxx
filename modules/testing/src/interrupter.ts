/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import {
  SubjectTree,
  SubjectPayload,
  Provisioning,
  UnObservablify,
} from '@react-mvi/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

export class Interrupter<S> {
  constructor(private provisioning: Provisioning<any>) {}

  public send<T>(type: string, payload: any = {}): this {
    this.provisioning.getSubject().notify({ type, payload });
    return this;
  }

  public subscribe(
    callback: (state: UnObservablify<S>) => void,
    runInitial = false,
  ): () => void {
    return this.provisioning.subscribe(callback, runInitial);
  }

  public wait<T extends string, P, S>(
    type: string,
  ): Promise<SubjectPayload<T, P, S>> {
    return this.provisioning
      .getSubject()
      .observable.pipe(filter(args => args.type === type))
      .toPromise();
  }
}
