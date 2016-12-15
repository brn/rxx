# IO modules.

## What is it?

IO modules is replacement of MVI intent layer.
IO modules process any type of io, like XHR, DOMEvent etc...

## How does this works?

IO modules perform their io process, if connected Observable submit values.  
So IO modules is simple class which process Observables.

## Input + Output

All IO modules has __input__ method named __subscribe__ and __output__ method named __response__,  
and all observable you passed to IO modules processed or subscribed within that __subscribe__ method.
Your service function recieve __response__ method return value that is defined in react-mvi as IOResponse  
as parameters.(See [Create service](./create_service.md#what-is-ioresponse))
