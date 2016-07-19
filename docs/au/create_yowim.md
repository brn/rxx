# Create your own IO Modules.

This section describe how you create your own io module.

## Examples

```typescript
import {
  Outlet
} from '@react-mvi/core';
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  MyApi
} from './my-api';


export class MyIOClass extends Outlet {
  subscribe(props: {[key: string]: Observable<any>}): Subscription {
    const sub = new Subscription();
    if (props['my-io']) {
      const obs = props['my-io'];
      for (let key in obs) {this.handleRequest(obs[key], key, sub)}
    }
    return sub;
  }

  handleRequest(subject, key, sub) {
    sub.add(obs[key].subscribe(v => {
      MyApi.post(v).then(res => {
        this.store.get(key).forEach(subject => {
         subject.next(res);
        })
      });
    }));
  }
}
```

Below example is send http request by MyApi and submit response to subject with key.  
Check this line.

```
this.store.get(key).forEach
```

`this.store` is base class that was named _Outlet_ property and holds some Rx.Subject with keys.  
If your service accessed IOResponse.for(key), at same time Rx.Subject made into Outlet.store with same key.
