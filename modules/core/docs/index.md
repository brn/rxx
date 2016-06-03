#  react-mvi
# react-mvi
Minimal framework for react + rxjs mvi architecture
[Documents](http://brn.github.io/react-mvi)
inspired by
[react-combinators](https://github.com/milankinen/react-combinators)
[react-reactive-toolkit](https://github.com/milankinen/react-reactive-toolkit)
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
"@react-mvi/core": [
"jspm_packages/npm/@react-mvi/core*"
],
"rxjs": [
"jspm_packages/npm/rxjs/*"
]
}
}
}
```
## Simple Usage
before this example,
- ```jspm install @react-mvi/http=npm:@react-mvi/http```
- ```jspm install @react-mvi/event=npm:@react-mvi/event```
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
# Index
* *[Globals](globals.html)** ["component/context"](modules/_component_context_.html)* ["component/subscriber"](modules/_component_subscriber_.html)* ["component/tags"](modules/_component_tags_.html)* ["component/utils"](modules/_component_utils_.html)* ["di/abstract-module"](modules/_di_abstract_module_.html)* ["di/binding"](modules/_di_binding_.html)* ["di/classtype"](modules/_di_classtype_.html)* ["di/index"](modules/_di_index_.html)* ["di/inject"](modules/_di_inject_.html)* ["di/injector"](modules/_di_injector_.html)* ["di/intercept"](modules/_di_intercept_.html)* ["di/method-proxy"](modules/_di_method_proxy_.html)* ["di/module"](modules/_di_module_.html)* ["env"](modules/_env_.html)* ["index"](modules/_index_.html)* ["io/io"](modules/_io_io_.html)* ["run"](modules/_run_.html)* ["service/service"](modules/_service_service_.html)* ["shims/lodash"](modules/_shims_lodash_.html)* ["shims/symbol"](modules/_shims_symbol_.html)* ["utils"](modules/_utils_.html)
Generated using [TypeDoc](http://typedoc.io)