/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import { Observable, Subscription, OperatorFunction } from 'rxjs';
import { isDefined } from '../utils';

interface FlatScanAggregateReturnType {
  aggregate: true;
  payload: any;
}

/**
 * Return type of flatscan.
 */
export type FlatScanReturnType<T> =
  | T
  | Promise<T>
  | Observable<T>
  | FlatScanAggregateReturnType
  | null
  | undefined;

/**
 * Return true is p is thenable.
 * @param p Maybe thenable object.
 * @returns boolean If true, p is thenable, otherwise not a thenable.
 */
const isPromise = <T>(p: any): p is Promise<T> => !!p && !!p.then;

const isAggregate = <T>(p: any): p is FlatScanAggregateReturnType =>
  !!p && !!p.aggregate;

/**
 * Process return value of flatscan and pass unwrapped value to callback function.
 * @param value Return value of flatscan
 * @param callback Callback function that receive unwrapped value.
 */
async function unwrapValue<T>(
  value: FlatScanReturnType<T>,
  callback: (value: T) => void,
) {
  if (value instanceof Observable) {
    callback(
      await new Promise<T>(resolve => {
        const subscription = value.subscribe(v => {
          subscription.unsubscribe();
          unwrapValue(v, resolve);
        });
      }),
    );
  } else if (isPromise<T>(value)) {
    await unwrapValue(await value, callback);
  } else if (isDefined(value)) {
    callback(value as any);
  }
}

/**
 * Serial flow control queue.
 */
class LockableQueuedBuffer {
  private _isLocked = false;
  private buffer: (() => Promise<any>)[] = [];

  /**
   * Execute function if not locked, otherwise buffered.
   * This function accept only async function,
   * and unlock if execution ended.
   * @param fn Function that will execute.
   */
  public async try(fn: () => Promise<any>) {
    if (this._isLocked) {
      this.buffer.push(fn);
    } else {
      this.run(fn);
    }
  }

  /**
   * Drain all buffeed values.
   * This function called automatically in 'try'.
   */
  private async drain() {
    this._isLocked = false;
    const next = this.buffer.shift();
    if (next) {
      this.run(next);
    }
  }

  private async run(fn: () => Promise<any>) {
    this._isLocked = true;
    await fn();
    await this.drain();
  }
}

export interface FlatScanOptions<T> {
  bufferingConfig?(value: T): number;
}

export function flatScan<T, U>(
  handler: (
    acc: T,
    value: U,
  ) => FlatScanReturnType<T> | Promise<FlatScanReturnType<T>>,
  initial?: T | Observable<T> | Promise<T>,
  options?: FlatScanOptions<U>,
): OperatorFunction<U, T> {
  return (observable: Observable<U>) => {
    return Observable.create(subscriber => {
      let subscription: Subscription;
      let lastValue: any = initial;
      let bufferingConfig: ((v: U) => number) | undefined;
      let isBuffering = false;
      let timer;

      const serialQueue = new LockableQueuedBuffer();

      if (options) {
        bufferingConfig = options.bufferingConfig;
      }

      unwrapValue(initial || ({} as any), initial => {
        subscription = observable.subscribe(async value => {
          let bufferingTime = 0;
          if (bufferingConfig) {
            bufferingTime = bufferingConfig(value);
          }
          const handleValue = async value => {
            const returnValue = handler(lastValue, value);
            if (!returnValue) {
              return;
            }

            await unwrapValue(returnValue, unwrapedValue => {
              if (isAggregate(unwrapedValue)) {
                return handleValue(unwrapedValue);
              }
              lastValue = unwrapedValue;
              if (isBuffering) {
                return;
              }
              if (bufferingConfig) {
                if (bufferingTime) {
                  isBuffering = true;
                  timer = setTimeout(() => {
                    isBuffering = false;
                    subscriber.next(lastValue);
                  }, bufferingTime);
                } else {
                  clearTimeout(timer);
                  subscriber.next(unwrapedValue);
                }
              } else {
                subscriber.next(unwrapedValue);
              }
            });
          };
          serialQueue.try(async () => handleValue(value));
        });
      });

      return () => subscription && subscription.unsubscribe();
    });
  };
}
