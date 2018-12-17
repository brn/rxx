/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import { Subject, Subscription } from 'rxjs';
import { Provisioning } from './provisioning';

export enum WorkerPostEventType {
  INITIALIZED = 'INITIALIZED',
  DISPATCHED = 'DISPATCHED',
  UPDATE = 'UPDATE',
}

export enum WorkerReceiveEventType {
  DISPATCH = 'DISPATCH',
  INITIALIZE = 'INITIALIZE',
  EXIT = 'EXIT',
}

export type WorkerPayload = { type: string; payload: any };
export const initWorker = (provisioning: Provisioning) => {
  const subject = new Subject<WorkerPayload>();
  const subscription = new Subscription();

  const post = process.env.RMVI_TEST
    ? ({ type, payload }: { type: string; payload: any }) => {
        global['RECEIVE_WORKER_MESSAGE']({ type, payload });
      }
    : typeof postMessage === 'function'
      ? ({ type, payload }: { type: string; payload: any }) => {
          postMessage({ type, payload });
        }
      : () => {};

  if (typeof Worker === 'function') {
    onmessage = e => {
      const { data } = e;
      subject.next(data);
    };
  }

  const publisher = provisioning.getPublisher();
  subscription.add(
    subject.subscribe(({ type, payload }) => {
      switch (type) {
        case WorkerReceiveEventType.DISPATCH:
          publisher(payload.type, payload.payload);
          provisioning.emitAsync(() =>
            post({ type: WorkerPostEventType.DISPATCHED, payload }),
          );
          break;
        case WorkerReceiveEventType.INITIALIZE:
          provisioning.prepare(payload);
          provisioning.subscribe((state, isInitial) => {
            if (isInitial) {
              post({
                type: WorkerPostEventType.INITIALIZED,
                payload: state.view,
              });
            } else {
              post({ type: WorkerPostEventType.UPDATE, payload: state.view });
            }
          }, true);
          break;
        case WorkerReceiveEventType.EXIT:
          publisher.unsubscribe();
          provisioning.dispose();
          subscription.unsubscribe();
          break;
        default:
          return;
      }
    }),
  );

  return subject;
};
