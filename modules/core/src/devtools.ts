/**
 * @fileoverview
 * @author Taketoshi Aono
 */

declare var process: {
  env: {
    NODE_ENV: string;
    [key: string]: string;
  };
};

export interface ReduxDevToolsStatic {
  connect(): ReduxDevTools;
  disconnect(): void;
}

export interface ReduxDevTools {
  init(s: any): void;
  send(value: { type: string; payload: any }, state: any): void;
  subscribe(
    monitor: (message: { type: string; payload: any; state: any }) => void,
  ): () => void;
}

class ReduxDevToolsStub implements ReduxDevTools {
  public init(s: any): void {}
  public send(value: { type: string; payload: any }, state: any): void {}
  public subscribe(
    monitor: (message: { type: string; payload: any; state: any }) => void,
  ): () => void {
    return () => {};
  }
}

export function isDevToolsInstalled() {
  return (
    !!window['__REDUX_DEVTOOLS_EXTENSION__'] &&
    process.env.NODE_ENV !== 'production'
  );
}

let instances: { [key: string]: ReduxDevTools } = {};
export function connectDevTools({ name, instanceId }): ReduxDevTools {
  if (isDevToolsInstalled()) {
    if (!instances[instanceId]) {
      return (instances[instanceId] = window['devToolsExtension'].connect({
        maxAge: 20,
        name,
        instanceId,
        features: { skip: false },
        serialize: {
          options: {
            undefined: true,
          },
          replacer: (key, value) => {
            if (value === window) {
              return '[object Window]';
            }
            if (value && value.type && value.target && value.preventDefault) {
              return { type: value.type };
            }
            return value;
          },
        },
      }));
    }
    return instances[instanceId];
  }
  return new ReduxDevToolsStub();
}

export function disconnectDevTools(instanceId): void {
  if (instances[instanceId] && isDevToolsInstalled()) {
    window['devToolsExtension'].disconnect({ instanceId });
    instances[instanceId] = null;
  }
}
