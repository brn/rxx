# react-mvi
Minimal framework for react + rxjs mvi architecture

[Documents](http://brn.github.io/react-mvi)

inspired by  
[react-combinators](https://github.com/milankinen/react-combinators)  
[react-reactive-toolkit](https://github.com/milankinen/react-reactive-toolkit)

## Guide

- Examples
    - [Simple Counter Programe](./docs/basic_guide.md)
-

    - [Single Page Application with react-router](./docs/spa.md)
- Basics
    - [Create component with context](./docs/basics/create_component.md)
    - [Create service](./docs/basics/create_service.md)
    - [IO modules](./docs/basics/io_modules.md)
    - [DI Container](./docs/basics/di_container.md)
- Advanced Usage
    - [Create your own IO modules.](./docs/au/create_yowim.md)
    - [Share injector](./docs/au/share_injector.md)

## Requirements

- jspm > 0.17.0-beta.16

## Installation

```jspm install @react-mvi/core=npm:@react-mvi/core```

### For typescript user.

Please install type definitions below.

* ```typings install dt~react --save --global```
* ```typings install dt~react-dom --save --global```

Typescript version < 1.9

* ```npm install rxjs --save```
* ```npm install @react-mvi/core```

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
      "@react-mvi/core": ["jspm_packages/npm/@react-mvi/core@0.3.3-beta.45/index.tsx"],
      "@react-mvi/http": ["jspm_packages/npm/@react-mvi/http@0.3.3-beta.41/index.ts"],
      "@react-mvi/event": ["jspm_packages/npm/@react-mvi/event@0.3.3-beta.23/index.ts"],
      "rxjs/*": ["jspm_packages/npm/rxjs@5.0.0-beta.10/*"]
    }
  }
}
```

## Simple Usage

See [Basic Guide](./docs/basic_guide.md)

```typescript
import * as React from 'react';
import {
  Observable
} from 'rxjs/Rx';
import {
  createModule,
  component,
  IOResponse,
  Tags as T,
  run,
  service,
  HttpMethod,
  ResponseType
} from '@react-mvi/core'
import {
  EventDispatcher
} from '@react-mvi/event'
import {
  HttpRequest,
  HttpResponse
} from '@react-mvi/http'


class Repository {
  public getCounterRequest(counterStream: Observable<number>) {
    return counterStream.map(counterValue => ({
      url: '/count',
      method: HttpMethod.POST,
      json: true,
      responseType: ResponseType.JSON,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        count: counterValue
      }
    }));
  }
}


class UseCase {
  public getCounterValue(event: IOResponse) {
    return event.for('counter::plus').mapTo(1)
      .merge(event.for('counter::minus').mapTo(-1))
      .scan((acc: number, e: number) => {
        return acc + e;
      }, 0)
  }
}


const Service = service(({http, event}: {[key: string]: IOResponse}, injector) => {
  const repository = injector.get('repository');
  const usecase = injector.get('usecase');
  const counterRequest = repository.getCounterRequest(usecase.getCounterValue(event));
  return {
    http: {
      'counter::mutate': counterRequest.publish()
    },
    view: {
      counter: http.for<HttpResponse<{count: number}, void>>('counter::mutate').map(e => e.response.count).startWith(0).publish()
    }
  }
});


const module = createModule(config => {
  config.bind('http').to(HttpRequest);
  config.bind('event').to(EventDispatcher);
  config.bind('usecase').to(UseCase);
  config.bind('repository').to(Repository);
  config.bind('aService').toInstance(Service);
});


const View = component((props: {counter: Observable<number>}, context) => {
  return (
    <div>
      <button onClick={context.io.event.asc('counter::plus')}>Plus</button>
      <button onClick={context.io.event.asc('counter::minus')}>Plus</button>
      <T.Div>conter value is {props.counter}</T.Div>
    </div>
  )
});

run({component: View, modules: [module]}, document.querySelector('#app'));
```
