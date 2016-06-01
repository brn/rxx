# react-mvi/http
react-mvi io module for event.

## Requirements

- jspm > 0.17.0-beta.16
- @react-mvi/core

## Installation

```jspm install @react-mvi/event=npm:@react-mvi/event```

### For typescript user.

Please install type definitions below.

* ```typings install dt~react --save --global```
* ```typings install dt~react-dom --save --global```

Typescript version < 1.9

tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES5",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "jsx": "React",
    "module": "system",
    "noImplicitAny": false
  }
}
```

Typescript version >= 1.9

tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES5",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "jsx": "React",
    "module": "system",
    "noImplicitAny": false
    "baseDir": ".",
    "baseURL": ".",
    "paths": {
      "@react-mvi/core": [
        "jspm_packages/npm/@react-mvi/core*"
      ],
      "@react-mvi/event": [
        "jspm_packages/npm/@react-mvi/event*"
      ],
      "rxjs": [
        "jspm_packages/npm/rxjs/*"
      ]
    }
  }
}
```


## Simple Usage

```typescript
import * as React from 'react';
import {
  createModule,
  component,
  Tags as T,
  run
} from '@react-mvi/core'
import {
  EventDispatcher
} from '@react-mvi/event'

const Service = ({event}) => {
  return {
    counter: event.for('user::click').scan((_, acc) => acc + 1, 0).startWith(0).publish();
  }
}

const module = createModule(config => {
  config.bind('event').to(EventDispatcher);
  config.bind('aService').toInstance(Service);
});

const View = component((props, context) => {
  return (
    <T.Div onClick={context.io.event.asc('user::click')}>conter value is {props.counter}</T.Div>
  )
});

run({component: View, modules: [module]}, document.querySelector('#app'));
```
