/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import * as React from 'react';
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
  return function view(app: StateFactory, otherProps: ProviderProps = {}): U {
    class Component extends React.Component<P> {
      public render() {
        const { props } = this;
        let name: string;
        const children =
          typeof RootViewOrFactory === 'function'
            ? (() => {
                name = `${RootViewOrFactory.displayName ||
                  RootViewOrFactory.name ||
                  getDefaultName()}#${IDGenerator.genNextId()}`;
                return <RootViewOrFactory {...props} />;
              })()
            : (() => {
                if (typeof RootViewOrFactory.type === 'function') {
                  name = `${RootViewOrFactory['type']['displayName'] ||
                    RootViewOrFactory['type']['name'] ||
                    getDefaultName()}#${IDGenerator.genNextId()}`;
                } else {
                  name = getDefaultName();
                }
                return React.cloneElement(
                  RootViewOrFactory as React.ReactElement<any>,
                  {
                    ...(RootViewOrFactory.props as any),
                    ...(props as any),
                  },
                  props.children,
                );
              })();
        return (
          <Provider app={app} name={name} {...otherProps}>
            {children}
          </Provider>
        );
      }
    }

    return renderingFn ? renderingFn(Component) : (Component as any);
  };
}

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
  initialState: {
    [P in keyof T]: T[P] extends ((a: any, b: infer X) => any) ? X : any
  },
) => StateFactory<
  {
    view: { [P in keyof T]: ReturnType<T[P]>['view'] };
  } & { [key: string]: Observable<any> }
> {
  return function(initialState: any) {
    return function(subject: Observable<any>, states: any = {}) {
      const initializedMap = {};
      return Object.keys(apps).reduce((states, key) => {
        const app = apps[key];
        const nextState = app(
          subject.pipe(
            map(payload => {
              if (payload.type === SystemEvent.REPLACE_STATE) {
                return {
                  ...payload,
                  payload: {
                    state: payload.payload.states[key],
                  },
                };
              }
              return payload;
            }),
          ),
          initialState[key],
        );
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
