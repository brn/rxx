/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import React from 'react';
import { Observable, isObservable, merge } from 'rxjs';
import { Provider, ProviderProps } from './component/provider';
import { mergeDeep, isDefined, IDGenerator } from './utils';
import { StateFactory } from './store/store';
import { map, startWith } from 'rxjs/operators';
import { SubjectPayload } from './subject';
import { SystemEvent } from './reducer';

function getDefaultName() {
  return 'AnonymousProvider';
}

export function makeView<P extends {} = any, U = React.ComponentClass<P>>(
  RootViewOrFactory:
    | React.ReactElement<P>
    | React.ComponentClass<P>
    | React.StatelessComponent<P>,
  renderingFn?: (el: React.ComponentClass<P>) => U,
): (app: StateFactory, otherProps?: any) => U {
  const displayName =
    typeof RootViewOrFactory === 'function'
      ? `${RootViewOrFactory.displayName ||
          RootViewOrFactory.name ||
          getDefaultName()}#${IDGenerator.genNextId()}`
      : (() => {
          if (typeof RootViewOrFactory.type === 'function') {
            return `${RootViewOrFactory['type']['displayName'] ||
              RootViewOrFactory['type']['name'] ||
              getDefaultName()}#${IDGenerator.genNextId()}`;
          }
          return getDefaultName();
        })();

  return function view(app: StateFactory, otherProps: ProviderProps = {}): U {
    class ViewEnhancedComponent extends React.Component<P> {
      public static displayName = displayName;
      public render() {
        const { props } = this;
        const children =
          typeof RootViewOrFactory === 'function' ? (
            <RootViewOrFactory {...props} />
          ) : (
            React.cloneElement(
              RootViewOrFactory as React.ReactElement<any>,
              {
                ...(RootViewOrFactory.props as any),
                ...(props as any),
              },
              props.children,
            )
          );

        return (
          <Provider app={app} name={displayName} {...otherProps}>
            {children}
          </Provider>
        );
      }
    }

    return renderingFn
      ? renderingFn(ViewEnhancedComponent)
      : (ViewEnhancedComponent as any);
  };
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
  }
>(
  apps: T,
): (
  initialState: InitialStateFactory<T>,
) => StateFactory<
  {
    view: { [P in keyof T]: ReturnType<T[P]>['view'] };
  } & { [key: string]: Observable<any> }
> {
  return function(initialStateFactory: InitialStateFactory<T>) {
    return function(subject: Observable<any>, states: any = {}) {
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
  };
}
