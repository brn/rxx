# Basics

## Create service.

react-mvi has service layer that create props of React Component.  
Usually service function or class is called by react-mvi auto when you call __run__ function.  
But react-mvi how distinguish service and other modules?

Examples

```typescript
import {
  service
} from '@react-mvi';

const s = service((io, injector) => {});
```

You only need attention to that line.

```typescript
const s = service((io, injector) => {});
```

We create service module from __service__ function.  
This __service__ function create function that was marked as service layer.  
So DI Container is able to distinguish service and other layer.

How is class?

Examples

```typescript
import {
  service
} from '@react-mvi';

@service
class Service {
  public initialize(io, injector) {
    return ...
  }
}
```

Only you need is use __service__ function as ES6 decorator.  
So this class marked as service layer.


## Service arugments.

Service layer accept two arguments.  
First is Map of IOResponse.
Second is Injector.

### What is IOResponse?

IOResponse is class that was created by IO modules.  
Usually IO modules has input method that is accept external value or triggered by external event.  
Where the output of IO?  
IOResponse is that, this class represent the result of io, and result value was flowed to  
Observable created by IOResponse.  

### How do I create Observable from IOResponse?

Simply, call __for__ method.  
All IOResponse has __for__ method that create Observbale from string key.

Examples

```typescript
import {
  service,
  IOResponse
} from '@react-mvi';

const s = service(({event}: {[key: string]: IOResponse}, injector) => {
  const es = event.for('foo::bar').mapTo(1);
});
```

`event.for('foo::bar')` is what we want to do is.  
Observable created from __for__ method has string key which represent event name,  
And this string key associate both __input__ and __output__.

### What is Injector

Injector is DI Container factory.  
Injector is able to create instance from dependency tree that called as _Module_, by passed at initializing.

Examples

```typescript
const s = service((io, injector) => {
  repository = injector.get('repository');
})
```

That example shows instantiation of Repository class from string key,  
that repository instance has resolved sub-dependencies.

Wanna know more?  
See [DI Container](./di_container.md)


## Service Result

Service function must return value as showed in below.

```typescript
const s = service(() => {
  return {
    http: {
      ...
    }
    view: {
      ...
    }
  }
})
```

That return value has the __view__ section and other IO specific sections.


### View Section

In brief,  
the __view__ section is React Component Props.  
Only __view__ section is passed to the view component.


### IO Specific Section

The IO specific sections are defined by each IO modules.  
In above examples __http__ section is IO Specific Section that processed by @react-miv/http.
Thease section is not decided by core modules, it's decided by each io modules.
