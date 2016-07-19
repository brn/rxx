# Basics

## Create service.

react-mvi has service layer that create props of React Component.  
Usually service function or class is called by react-mvi by auto at time when you call 'run' function.  
But react-mvi how do distinguish service and other modules?

Examples

```
import {
  service
} from '@react-mvi';

const s = service((io, injector) => {});
```

You only need attention to that line.

```
const s = service((io, injector) => {});
```

We create service module from 'service' function.  
This 'service' function create function that was marked as service layer.  
So DI Container could distinguish service and other layer.

How is class?

Examples

```
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

Only you need is use 'service' function as ES6 decorator.  
So this class marked as service layer.


## Service arugments.

Service layer accept two arguments.  
One is Map of IOResponse.

### What is IOResponse?

IOResponse is class that was created by IO modules.  
Usually IO modules was input that is accept external value or triggered by external event.  
Where the output of IO?  
IOResponse is that, this class represent the result of io and result value was flowed to  
Observable created by IOResponse.  

### How do I create Observable from IOResponse?

Simply, call 'for' method.  
All IOResponse has for method that create Observbale from string key.

Examples

```
import {
  service,
  IOResponse
} from '@react-mvi';

const s = service(({event}: {[key: string]: IOResponse}, injector) => {
  const es = event.for('foo::bar').mapTo(1);
});
```

`event.for('foo::bar')` is what we want to do is.  
Observable created from 'for' method has string key which represent event name,  
And this string key associate both _input_ and _output_.
