# Basic Guide

## Simple Counter Program

Sample sources exisists in [HERE](../../../examples/counter)

## Preparation

```
npm init # make package.json
jspm init # make config.js

jspm install @react-mvi/core=npm:@react-mvi/core
jspm install @react-mvi/http=npm:@react-mvi/http
jspm install @react-mvi/event=npm:@react-mvi/event

jspm install react
jspm install react-dom
jspm install rxjs

npm install @react-mvi/core @react-mvi/http @react-mvi/event
npm install rxjs

touch tsconfig.json

cd src
typings install react react-dom --save
```


## Let's Begin

First of all, create index.tsx.

This examples show basic implementations of react-mvi,

so this example does not separate modules, all of implementations into index.tsx.


### Specification

Now we show this expample application specification following.

```
[Button plus] [Button minus] [String 'counter value 0']
```

If you click button plus, [String counter value 0] will become 1.
If you click button minus, will becom -1.

And that counter value was saved in DB.


### Implementations


#### Repository

First, create request part of the application.

Request part name is 'Repository' from 'Clean Architecture'.

```typescript
class Repository {
  public getCounterRequest(counterStream: Observable<number>) {
    return counterStream.map(counterValue => ({
      url: 'localhost:8989',
      method: 'POST',
      json: true,
      body: {
        count: counterValue
      }
    }));
  }
}
```

This Repository#getCounterRequest accept Observable that flow to counter value,

and return Obsevable that return post request to 'localhost:8989'.

#### UseCase

So next, Create logic of counter. Domain Logic name is 'UseCase' from 'Clean Architecture'.

```typescript
class UseCase {
  public getCounterValue(event: IOResponse) {
    return event.for('user::clicked').scan((acc, e) => {
      return acc + 1;
    }, 0)
  }
}
```

This UseCase##getCounterValue accept react-mvi IOResponse instance and

return Observable that flow to changed counter value.

#### Service

Next, now create React props generator which is generate props from composition of repository and usecase.

```
const Service = service(({http, event}, injector) => {
  const repository = injector.get('repository');
  const usecase = injector.get('usecase');
  const counterRequest = repository.getCounterRequest(usecase.getCounterValue(event));
  return {
    http: {
      'counter::mutate': counterRequest.publish()
    },
    view: {
      counter: http.for('counter::mutate').map(e => e.response).publish()
    }
  }
});
```

This Service create Props and IO Properties from UseCase and Repository.

#### Module

Next, Create modules of dependency tree of repository, usecase and service.

```
const module = createModule(config => {
  config.bind('http').to(HttpRequest);
  config.bind('event').to(EventDispatcher);
  config.bind('usecase').to(UseCase);
  config.bind('repository').to(Repository);
  config.bind('aService').toInstance(Service);
});
```

This Module combine all dependecies.

#### View

Just a little bit more! Create React component.

```
const View = component((props: {counter: Observable<number>}, context) => {
  return (
    <T.Div onClick={context.io.event.asc('counter::clicked')}>conter value is {props.counter}</T.Div>
  )
});
```

The View accept props that containing Observable.

But, React props can't process Observables propery.

So now wrap Observable props by react-mvi Tags that was renamed to 'T' and make it is able to process props that containing Observables.


#### Bootstrap


Finally combine all modules and run application.

```
run({component: View, modules: [module]}, document.querySelector('#app'));
```


#### Running

```
gulp serve
```

Access to localhost:8989.
