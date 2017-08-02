# Create your own StateHandler.

This section describe how you create your own StateHandler.

## Examples

```typescript
import {
  StateHandler
} from '@react-mvi/core';
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  MyApi
} from './my-api';


export class MyHandler extends StateHandler {
 /**
  * Subscribe create subscription for Observables defined in State that created in Store.
  */
  subscribe(props: {[key: string]: Observable<any>}): Subscription {
    const sub = new Subscription();
    if (props['my-state']) {
      const obs = props['my-state'];
      Object.keys(obs).forEach(k => {
        sub.add(obs[k].subscribe(v => this.push(k, v)));
      });
    }
    return sub;
  }

 /**
  * Push is main process of StateHandler.
  * This method should be callable from external.
  */
  push(key: string, request: Object) {
    MyApi.post(request).then(res => {
      this.store.get(key).forEach(subject => {
        subject.next(res);
      })
    });
  }
}
```

Above example is send http request by MyApi and submit response to subject with key.  
Check these two line.


```typescript
export class MyHandler extends StateHandler {
```

```typescript
this.store.get(key).forEach
```

First, StateHandler class must extends StateHandler.  
Second, `this.store` is base class _StateHandler_ protected property and holds some Rx.Subject with keys.  
If your Intent accessed HandlerResponse.for(key), at same time Rx.Subject is made inside of StateHandler.store with same key.
