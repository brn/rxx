/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import { Observable, isObservable, merge, Subject } from 'rxjs';
import { mergeDeep, isDefined, IDGenerator } from './utils';
import { StateFactory } from './store/store';
import { map, startWith } from 'rxjs/operators';
import { SubjectPayload } from './subject';
import { SystemEvent } from './reducer';
import { Provisioning } from './provisioning';
import { isObject } from './utils';
import { IntentConstructor } from './intent/intent';
import { initWorker, WorkerPayload } from './worker';

function getDefaultName() {
  return 'AnonymousProvider';
}

export type InitialState<T> = {
  [P in keyof T]: T[P] extends ((a: any, b: infer X) => any) ? X : any
};

export type InitialStateFactory<T> = InitialState<T> | (() => InitialState<T>);

export function makeApp<
  T extends {
    [key: string]: StateFactory<{
      view: Observable<any>;
      [key: string]: Observable<any>;
    }>;
  },
  X extends { [key: string]: any }
>(
  apps: T,
  initialStateFactory: InitialStateFactory<T>,
  otherProps: X = {} as any,
): StateFactory<
  {
    view: { [P in keyof T]: ReturnType<T[P]>['view'] };
  } & { [key: string]: Observable<any> }
> {
  return function app(subject: Observable<any>, states: any = {}) {
    let initialState: InitialState<T>;
    if (typeof initialStateFactory === 'function') {
      initialState = initialStateFactory();
    } else {
      initialState = initialStateFactory;
    }
    const initializedMap = {};
    return Object.keys(apps).reduce((states, key) => {
      const app = apps[key];
      const nextState = app(subject, initialState[key]);
      if (nextState.view) {
        if (!isObservable(nextState.view)) {
          throw new Error(`Application view of ${key} must be Observable.`);
        }
        nextState.view = nextState.view.pipe(startWith(initialState[key]));
        if (!states.view) {
          states.view = {};
        }
        if (!isDefined(states.view[key])) {
          states.view[key] = nextState.view;
        } else {
          states.view[key] = merge(states.view[key], nextState.view);
        }
      }
      for (const key in nextState) {
        if (key !== 'view') {
          if (!nextState[key] || !(nextState[key] instanceof Observable)) {
            throw new Error(`Property ${key} must be Observable.`);
          }
          if (states[key]) {
            states[key] = merge(states[key], nextState[key]);
          } else {
            states[key] = nextState[key];
          }
        }
      }
      return states;
    }, states);
  };
}

export function run<
  T extends {
    [key: string]: StateFactory<{
      view: Observable<any>;
      [key: string]: Observable<any>;
    }>;
  },
  X extends { [key: string]: any }
>(
  apps: T,
  initialStateFactory: InitialStateFactory<T>,
  otherProps: X = {} as any,
): Subject<WorkerPayload> {
  return initWorker(
    new Provisioning(
      otherProps.intent
        ? isObject<{ [key: string]: IntentConstructor }>(otherProps.intent)
          ? otherProps.intent
          : { intent: otherProps.intent }
        : {},
      otherProps.store
        ? Array.isArray(otherProps.store)
          ? otherProps.store
          : [otherProps.store]
        : [],
      makeApp(apps, initialStateFactory),
      otherProps.service,
      otherProps.stateHandlers || {},
    ),
  );
}
