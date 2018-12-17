# Examples

## Use with ract-router.

```typescript
import {
  Provider
} from '@react-mvi/core';
import {
  render
} from 'react-dom';
import {
  Route,
  Router,
  hashHistory
} from 'react-router';
import {
  AComponent
} from './view/a-component';
import {
  Intent
} from './intents/intent';
import {
  Store
} from './stores/store';


class Component {
  render() {return <Provider store={Store} intent={Intent}><AComponent></Provider>}
}

render((
  <Router history={hashHistory}>
    <Route path="/">
      <Route path="login" component={Component}/>
    </Route>
  </Router>
), document.querySelector('#app'));
```

If you want to use react-router with react-mvi, create high-order component with Provider.
