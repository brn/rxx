# react-mvi/http
react-mvi io module for http request.

## Requirements

- jspm > 0.17.0-beta.16
- @react-mvi/core

## Installation

```jspm install @react-mvi/http=npm:@react-mvi/http```

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
      "@react-mvi/http": [
        "jspm_packages/npm/@react-mvi/http*"
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
import {
  HttpRequest,
  HttpMethod,
  ResponseType
} from '@react-mvi/http'

const Service = ({http, event}) => {
  return {
    http {
      testReq: event.for('user::click').map({
        method: HttpMethod.GET,
        url: '/profile',
        json: true,
        responseType: ResponseType.JSON,
        key: 'user::profile'
      })
    },
    profile: http.for('user::profile').map(v => v.picture).startWith('').publish()
  }
}

const module = createModule(config => {
  config.bind('http').to(HttpRequest);
  config.bind('event').to(EventDispatcher);
  config.bind('aService').toInstance(Service);
});

const View = component((props, context) => {
  return (
    <T.Button onClick={context.io.event.asc('user::click')}>Get Picture!</T.Button>
    <div><span><T.Img src={props.profile} /></span></div>
  );
});

run({component: View, modules: [module]}, document.querySelector('#app'));
```
