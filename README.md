# react-mvi
Minimal framework for react + rxjs mvi architecture

inspired by  
[react-combinators](https://github.com/milankinen/react-combinators)  
[react-reactive-toolkit](https://github.com/milankinen/react-reactive-toolkit)

## Requirements

- jspm > 0.17.0-beta.16

## Installations

```jspm install @react-mvi/core```

If you are typescript user.

* ```typings install dt~react --save --global```
* ```typings install dt~react-dom --save --global```
* ```typings install immutable --save```
* ```typings install lodash --save```
* ```npm install rxjs --save```
* If typescript version is < 0.19, ```npm install @react-mvi/core --save```


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
  HttpRequest
} from '@react-mvi/http'

const Service = ({http, event}) => {
  return {
    counter: event.for('user::click').scan((_, acc) => acc + 1, 0).publish();
  }
}

const module = createModule(config => {
  config.bind('http').to(HttpRequest);
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
