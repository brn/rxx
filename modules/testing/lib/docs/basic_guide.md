# Basic Guide

## Simple Counter Program

Sample sources exists in [HERE](../examples/counter)

## Preparation

Below preparation was already done if you use above example project.  
So simply call `npm install` or `yarn install`.

```
npm init # make package.json
npm i @react-mvi/core @react-mvi/http rxjs react react-dom @types/react @types/react-dom es6-promise es6-symbol -D

touch tsconfig.json
```

es6-promise and es6-symbol is required if execution environment is not implements these.

## Configuration Typescript

Skip if use example project.

```json
{
  "compilerOptions": {
    "target": "ES5",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "jsx": "React",
    "module": "commonjs",
    "noImplicitAny": false,
    "lib": ["dom", "es5", "es6", "es2016", "es2017"],
    "alwaysStrict": true
  }
}
```

Now we make as like above.  
But be careful of about only 'lib' section.  
react-mvi need `Promise` type and `Symbol` type, so you need some Ecamascript lib.


## Let's Begin

First of all, create index.tsx.

This examples show basic implementations of react-mvi,

so this example does not separate modules, all of implementations into index.tsx.


### Specification

Now we show this expample application specification as below.

```
[Button plus] [Button minus] [String 'counter value 0']
```

If you click button plus, [String counter value 0] will become 1.  
If you click button minus, will becom -1.

And that counter value was saved in DB.


### Implementations

#### 1. registerHandlers

First, register http module as StateHandler.

```typescript
registerHandlers({ http: new HttpHandler() });
```

#### 2. Intent

Next, create intent class that receive response of StateHandler and Intent,  
like below, `HandlerResponse#for` used like `this.intent.for` or `this.http.for` create or get observable bound to specific key.  
And `@intent` decorator will bind registeredHandlers that registered in step 1 as instance properties.

```typescript
@intent
class Intent {
  // HandlerResponse instance of registered StateHandler that registered in step 1 was bounded.
  private http: HandlerResponse;

  // intent is always bounded.
  private intent: HandlerResponse;

  public plus() {
    return this.intent.for<number, State>('counter::plus').share();
  }

  public minus() {
    return this.intent.for<number, State>('counter::minus').share();
  }

  public saved(): Observable<{ count: number }> {
    return this.http.for<HttpResponse<{ count: number }, void>, State>('counter::save')
      .filter(({ data }) => data.ok)
      .map(({ data }) => data.response)
      .share();
  }
}
```

#### Stores

##### 3. HttpStore

First, create request part of the application.  
Request part name is HttpStore.  
`@store` decorator bound `intent` that created step 2 as instance member.

```typescript
@store
class HttpStore implements Store<ObservableHttpState> {
  private intent: Intent;

  public initialize() {
    const stream = this.intent.plus().mapTo(1)
      .merge(this.intent.minus().mapTo(-1))
      .scan((acc, next) => acc + next, 0);

    return {
      http: {
        'counter::save': stream.map(count => ({
          url: '/count',
          method: HttpMethod.POST,
          json: true,
          responseType: ResponseType.JSON,
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            count
          }
        }))
      }
    };
  }
}
```

This HttpStore#initialize create Observable state that post request to 'localhost:8989' for @react-mvi/http.

##### 4. ViewStore

So next, Create domain of counter. Domain Logic name is ViewStore.

```typescript
@store
class ViewStore implements Store<ObservableViewState> {
  private intent: Intent;

  public initialize(): ObservableViewState {
    return {
      view: {
        counter: this.intent.saved().map(({ count }) => count)
      }
    };
  }
}
```

This ViewStore#initialize create Observable that is handled by view state.

#### 5. View

Just a little bit more!

Create view of application with react.  
This view component is decorated by connect function like redux,  
but typescript can't affect return type of decorators to class,  
so we use connect as ordinal function.

```typescript
const View = connect({
  mapIntentToProps(intent) {
    return {
      onPlus: intent.callback('counter::plus'),
      onMinus: intent.callback('counter::minus'),
    };
  }
})(class View extends React.Component<ViewProps, {}> {
  public render() {
    return (
      <div>
        <button onClick={this.props.onPlus}>Plus</button>
        <button onClick={this.props.onMinus}>Minus</button>
        <T.Div>conter value is {this.props.counter}</T.Div>
      </div>
    );
  }
});
```

The View accept props that containing Observable, but React can't process props that containing Observables propery.  
So we wrap ReactElement by react-mvi `Tags` that was renamed to 'T' and make it is able to process props that containing Observables.

#### 6. Bootstrap

Finally combine all Store and Intent with `Provider` component.

```typescript
render(
  <Provider intent={Intent} store={[ViewStore, HttpStore]}>
    <View />
  </Provider>, document.querySelector('#app'));
```

#### Running

```
npm run bundle
npm start
```

Access to localhost:8989.
