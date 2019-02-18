# StateHandler.

## What is it?

StateHandler is replacement of MVI intent layer.
StateHandler process any type of io, like XHR, DOMEvent etc...

## How does this works?

StateHandler process state value created by store, if connected Observable send values.  
So StateHandler is simple class which process Observables.

## Input + Output

All StateHandler modules has __input__ method named __subscribe__ and __output__ method named __response__,  
and all observable you passed to StateHandler modules processed or subscribed within that __subscribe__ method.  
Then your `Intent` class recieve __response__ method return value that is defined in `@rxx/core` as HandlerResponse  
as parameters.(See [Create Intent](./create_intent.md#what-is-handlerresponse))
