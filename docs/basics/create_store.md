# Basics

## Create Store.

rxx has store layer that has state of application.  
Usually store class is called by rxx auto when you render `Provider` component.

### Implements Store

Below case is most simple Store implementation.

**Example**

```typescript
import {
  store,
  Store
} from '@rxx/core';
import {
  Observable
} from 'rxjs/Rx';
import {
  AppIntent
} from '../intents/intent';


@store
export class AppStore implements Store<{view: {greeting: Observable<string>}}> {
  private intent: AppIntent;

  public initialize() {
    return {
      view: {
        greeting: this.intent.onMounted.mapTo('Hello World!').startWith('')
      }
    };
  }
}
```

Store class must implements `initialize()` method that function return Application State as __RxJS Observable__.
And Store class must decorated by `store` decorator, that decorator merge intent as instance property.


### Store.initialize return value

Store class must return value as shown in below.

```typescript
return {
  http: {
    ...
  }
  view: {
    ...
  }
}
```

That return value has the __view__ section and other section is StateHandler specific sections.


### View Section

In brief,  
the __view__ section is handled by [React Component that connected to Provider](./create_connected_component.md).  
And only __view__ section is passed to the Root Component.


### StateHandler Specific Section

The StateHandler specific sections are defined by each StateHandlers.  
In above examples __http__ section is StateHandler Specific Section that processed by `@react-miv/http`.
These section is not decided by core modules, it's decided by each StateHandler modules.
