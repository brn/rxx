# Basics

## Create react component with context.

React Component has system called context.

### What is context?

Context is system which share common function, properties and etc...  
Context was unlike props, do not need pass through children components.
To share context, simply define context value at the root component  
and if you want to use context properties,  
you simply add some required properties to child component.

### In react-mvi

react-mvi use context system as well.  
react-mvi context has some useful function or properties.  

How do you create component which has context?

The component which has created from `Provider` has root context,  
so, only you need is create child component with `context` decorator function of `react-mvi/core`.

*Exmaples*

```typescript
import {
  context,
  ProviderContextType
} from '@react-mvi/core';

export interface Props {
  ...
}

@context
class Component extends React.Component<Props, {}> {
  public context: ProviderContextType<{}>;

  render() {
    ...
  }
}
```

or


```typescript
import {
  view,
  ProviderContextType
} from '@react-mvi/core';

export interface Props {
  ...
}

const Component = view((props: Props, context: ProviderContextType<{}>) => {
    return ...
}, 'Component');
```

It is easy, isn't it?  
__view__ function accept two argument type.  
First is function that is return React Component and this function called by props and context.  
Second is class that extends React Component and that class has props and context in instance properties.  

That's all!  

Oh, forgot one thing,
The last arguments of __view__ function is component name.  
What is component name?  
React component has name which named by __function.name__ or __displayName__ property.
The __view__ function add displayName to your component to easy to debug.
