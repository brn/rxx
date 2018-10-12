/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import { Observable, Subscription, OperatorFunction } from 'rxjs';
import {
  flatScan,
  FlatScanOptions,
  FlatScanReturnType,
} from './observable/flatscan';
import { SubjectPayload } from './subject';

/**
 * Return type of reducer.
 */
type ReducerReturnType<T> = FlatScanReturnType<T>;

export enum SystemEvent {
  REPLACE_STATE = '@System::replace-state',
}

export type ReducerOptions<T> = FlatScanOptions<T>;

export function reducer<T extends SubjectPayload<string, any, any>, U>(
  source: Observable<T>,
  handler: (
    state: U,
    payload: T,
  ) => ReducerReturnType<U> | Promise<ReducerReturnType<U>>,
  initial?: U | Observable<U> | Promise<U>,
  options?: ReducerOptions<T>,
): Observable<U> {
  return source.pipe(
    flatScan(
      (state, payload) => {
        if (payload.type === SystemEvent.REPLACE_STATE) {
          return payload.payload.state;
        }
        return handler(state, payload);
      },
      initial,
      options,
    ),
  );
}
