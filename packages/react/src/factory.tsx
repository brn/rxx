/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import React from 'react';
import { Observable, isObservable, merge } from 'rxjs';
import { Provider, ProviderProps } from './component/provider';
import { mergeDeep, isDefined, IDGenerator } from './utils';
import { map, startWith } from 'rxjs/operators';

function getDefaultName() {
  return 'AnonymousProvider';
}

export function makeView<P extends {} = any, U = React.ComponentClass<P>>(
  RootViewOrFactory:
    | React.ReactElement<P>
    | React.ComponentClass<P>
    | React.StatelessComponent<P>,
  renderingFn?: (el: React.ComponentClass<P>) => U,
): (initWorker: () => Worker) => U {
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

  return function view(initWorker: () => Worker): U {
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
          <Provider name={displayName} initWorker={initWorker}>
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
