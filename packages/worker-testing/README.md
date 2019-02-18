# @react-mvi/testing

## What's this?

`@react-mvi/testing` is test utility for `@react-mvi`.

## Installation

```
npm i @react-mvi/testing -D
```

## Usage

```typescript
import {
  Prepared,
  prepareTest
} from '@react-mvi/testing';
import {
  Observable
} from 'rxjs/Rx';
import {
  AppStore
} from '../store';
import {
  AppIntent
} from '../../intents/intent';
import {
  expect
} from 'chai';


describe('AppStore', () => {
  let prepared: Prepared<{view: {greeting: Observable<string>}}>;
  beforeEach(() => {
    prepared = prepareTest(AppIntent, AppStore);
  });

  describe('initialize().view.greeting', () => {
    it('should send greet to stream.', done => {
      const { store, mock } = prepared;
      const { greeting } = store.initialize().view;
      greeting.skip(1).subscribe(v => {
        expect(v).to.be.eq('Hello World!');
        done();
      });
      mock.send('onMounted', {});
    });
  });
});

```

We support easy Store construction.


## API

#### Prepared

```typescript
// Response type of `prepareTest`.
type Prepared<V> = {
  stores: Store<V>[];
  store: Store<V>;
  mock: MockManipulator;
};
```

#### PrepareOptions

```typescript
// Options type of `prepareTest`.
type PrepareOptions = {
  services?: { [key: string]: any };
  handlers?: { [key: string]: StateHandler };
  state?: any;
};
```

#### prepareTest


```typescript
/**
 * Prepare Intent and Store.
 * @param IntentClass User defined Intent class that want to mocking.
 * @param StoreClass User deinfed Store class that wnat to testing.
 * @return Return mocked Intent and associated Store.
 */
function prepareTest<T extends IntentConstructor, U extends StoreConstructor<T, V>, V>(
  IntentClass: T,
  StoreClass: StoreConstructor<T, V> | StoreConstructor<T, V>[],
  opt: PrepareOptions = { state: {} }): Prepared<V>
```


#### Mocker

Mocking Intent class by replace all method with simple function that return Rx.Subject that controlled by MockManipulator.

### MockManipulator

```typescript
class MockManipulator {
 /**
  * Send value to Rx.Subject that is assosiated with Intent by Mocker.
  * @param name Method name of Intent.
  * @param data Parameter of Intent.
  */
  public send(name: string, data: any = {}): void

 /**
  * Static version of above `send`.
  */
  public static send(mock: Mocker, name: string, data: any = {})
}
```
