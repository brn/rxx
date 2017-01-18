# react-mvi/event
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
      "@react-mvi/event": ["jspm_packages/npm/@react-mvi/event@{version-you-installed}/index.ts"],
      ...
    }
  }
}
```


## Usage

First, register EventDispatcher class to @react-mvi/core di container module.

```typescript
import {
  AbstractModule
} from '@react-mvi/core';
import {
  EventDispatcher
} from '@react-mvi/event';


export class Module extends AbstractModule {
  configure() {
    this.bind('event').to(EventDispatcher).asSingleton();
  }
}
```

@react-mvi/event exists in context.io.

See example below.

```typescript
import React from 'react';
import {
  ContextType
} from '@react-mvi/core';

@context
class FooComponent extends React.Component<any, any> {
  public context: ContextType;

  public render() {
    return (
      <button onClick={this.context.io.event.callback('test::click')}>TEST</button>
      <button onClick={e => this.context.io.event.push('test::click', e)}>TEST</button>  // same as above.
    )
  }
}
```

## EventDispatcher Specification

### push(key: string, args: any): void

Trigger observable that connected to specified key.

```typescript
event.response.for('foo::click').subscribe(v => {
  assert.equal(v, 'ok');
})

this.context.io.event.push('foo::click', 'ok');
```

### callback(key: string, args: any): (args: any) => void

Wrap `push` function by anonymous function.


### response: IOResponse

Return IOResponse instance.
