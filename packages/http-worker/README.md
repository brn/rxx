# @react-mvi/http

react-mvi StateHandler for http request.

## Requirements

- @react-mvi/core >= 1.0.0

## Installation

```nps install @react-mvi/http```

## Usage

First, register HttpHandler to @react-mvi/core handlers by __registerHandlers__.

```typescript
import {
  registerHandlers
} from '@react-mvi/core';
import {
  HttpHandler
} from '@react-mvi/http';


registerHandlers({
  http: new HttpHandler()
})
```

`@react-mvi/http` use http property of Store returned object.

See example below.

Create request stream.

```typescript
// Send request.
class AStore extends Store<{http: {[key: string]: HttpConfig}}> {
  public render() {
    return {
      http: {
        'app::requestSubmit': this.intent.onSubmit().mapTo({...})
      }
    }
  }
}
```

Receive response with stream.

```typescript
@intent
class Intent {
  private intent: HandlerResponse;
  private http: HandlerResponse;
  
  public onSubmit() {
    return this.intent.for('app::onSubmit');
  }

  public onSubmitResponse() {
    return this.http.for('app::requestSubmit');
  }
}

// In Store.
this.intent.onSubmitResponse().map(...)
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
