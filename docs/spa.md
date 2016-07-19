# Examples

## Use with ract-router.

```
import {
  runnable
} from '@react-mvi/core';
import {
  render
} from 'ReactDOM';
import {
  Route,
  Router,
  hashHistory
} from 'react-router';

render((
  <Router history={hashHistory}>
    <Route path="/">
      <Route path="login" component={runnable({component: Login, modules: [SomeModules]})}/>
    </Route>
  </Router>
), document.querySelector('#app'));
```

If you want to use react-router with react-mvi, use runnable.

A runnable function create React Component which was combined all modules.
