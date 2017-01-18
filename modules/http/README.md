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

```
npm install @react-mvi/http
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
      "@react-mvi/http": ["jspm_packages/npm/@react-mvi/http@{version-you-installed}/index.ts"],
      ...
    }
  }
}
```


## Usage

First, register HttpRequest class to @react-mvi/core di container module.

```typescript
import {
  AbstractModule
} from '@react-mvi/core';
import {
  HttpRequest
} from '@react-mvi/http';


export class Module extends AbstractModule {
  configure() {
    this.bind('http').to(HttpRequest).asSingleton();
  }
}
```

@react-mvi/http use http property of service returned object.

See example below.

```typescript
// Send request.
const myService = service((io, injector) => {
  ...
  return {
    http: {
      'foo::bar': someHttpReq
    }
  }
})
```

```typescript
// Receive response.
http.response.for('foo::bar').map(res => res.response);
```

## Request Specification

```typescript
interface HttpConfig {
  url: string;
  method?: HttpMethod;
  headers?: any;
  mode?: 'cors'|'same-origin'|'no-cors';
  json?: boolean;
  data?: string|Blob|FormData,
  form?: boolean;
  responseType?: ResponseType
}
```

### url

Request url.

### method

Request method type. It defined in HttpMethods enum.

```typescript
enum HttpMethod {
  GET = 1,
  POST,
  PUT,
  DELETE
}
```

### headers

Request headers.

### mode

Fetch api mode.

### json

Send json or not.

### data

Request body.

### form

Using www-form-urlencoded.

### responseType

Response body type. It defined in ResponseType enum.

```typescript
enum ResponseType {
  JSON = 1,
  BLOB,
  ARRAY_BUFFER,
  FORM_DATA,
  TEXT
}
```

## Response Specification

```typescript
interface HttpResponse<T, E> {
  ok: boolean;
  headers: {[key: string]: string};
  status: number;
  response: T;
  error: E;
}
```

### ok

Flag that show response was 30X or 20X.

### headers

Response headers.

### status

Response status number.

### response

Response body.

### error

Error message if error occured.
