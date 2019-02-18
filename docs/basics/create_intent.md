# Basics

## What is Intent?

Intent is `user will` that include click, touch, scroll, etc...  
__Intent receive user will and convert it to RxJS Observable.__

### Implements Intent

Below examples is most simple intent implementation.

**Examples**

```typescript
import {
  intent,
  HandlerResponse
} from '@rxx/core';


@intent
export class AppIntent {
  private intent: HandlerResponse;

  public get onMounted() {
    return this.intent.for<{}, {}>('app::mounted').share();
  }
}

```

Intent must decorated by `intent` decorator of `@rxx/core`.  
So `intent` decorator merge HandlerResponse to intent instance.  
And only you need to implements is `intent.for(key: string)`.


### What is HandlerResponse?

HandlerResponse is class that was created by StateHandler modules.  
Usually StateHandler modules has input method that is accept external value or triggered by external event.

So, where the output of StateHandler?  
HandlerResponse is that, this class represent the result of StateHandler, and result value was send to  
Observable created by HandlerResponse.  

### How do I create Observable from HandlerResponse?

Simply, call __for__ method.  
All HandlerResponse has __for__ method that create Observbale from string key.

Examples

```typescript
onMounted() {
  return this.intent.for<{}, {}>('app::mounted').share();
}
```

`this.intent.for<{}, {}>('app::mounted')` is what we want to do is.  
Observable created from __for__ method has string key which represent event name,  
And this string key associate both __input__ and __output__.


### Previous State

HandlerResponse send previous state of Store,  
so return type of HandlerResponse.for become like that.

```
interface Response {
  for<ResponseType, StateType>(key: string): Observable<{data: ResponseType, state: StateType}>;
}
```

So if you want to access other stream value, simply extract value from `state`.
