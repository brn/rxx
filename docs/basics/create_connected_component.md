# Basics

## Create react component that connected to Provider.

Root Component must connect Provider with `connect` decorator of `@react-mvi/core`;
Component that decorated by connect could access some optional context and props.

### What is connect?

`connect` decorator is like [react-redux](https://github.com/reactjs/react-redux)'s connect decorator.  
That has map function like `mapStateToProps` and `mapIntentToProps`.  

### Options

```typescript
connect({
  /**
   * mapStateToProps convert state to ReactComponent props.
   * In below case, `testState` accessible as this.props.testState within component.
   */
  mapStateToProps(state) {
    return {
      testState: state.test
    }
  },

  /**
   * mapIntentToProps convert intent to ReactComponent props.
   * In below case, `onClick` accessible as `this.props.onClick` within component.
   * and onClick is simple function that hasn't any this context, so simply call as like `onClick()`.
   */
  mapIntentToProps(intent) {
    return {
      onClick: intent.callback('test::click')
    }
  }
})
```

### Use with typescript

In typescript, decorator can't change type of class,
so you need to call connect as function.

*Exmaples*

```typescript
import {
  connect,
  PoviderContextType
} from '@react-mvi/core';

export interface Props {
  ...
}

export const Component = connect()(class Component extends React.Component<Props, {}> {
  public context: ProviderContextType<{}>;

  render() {
    ...
  }
})
```
