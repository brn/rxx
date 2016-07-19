# Basics

## Create react component with context.

React component has system called context.

### What is context?

Context is system which share common function, properties and etc...  
Context was unlike props, do not need pass through children components, to share context,  
simply define context value at the root component and if you want to use context properties,  
child component simply add some required properties,

### In react-mvi

react-mvi use context system as well.  
react-mvi context has some useful function or properties and IO modules.  

How do I create component which has context.

react-mvi component which has created from __run__ or __runnable__, has root context,  
so, only you need is create child component by 'component' function of react-mvi.

*Exmaples*

```typescript
import {
  component,
  ContextType
} from '@react-mvi/component';

export interface Props {
  ...
}

const Component = component((props: Props, context: ContextType): React.Component<T, {}> => {
  ...
}, 'Component');
```

or


```typescript
import {
  component,
  ContextType
} from '@react-mvi/component';

export interface Props {
  ...
}

const Component = component(class extends React.Component<Props, {}> {
  public render() {
    return ...
  }
}, 'Component');
```

It is easy, isn't it?  
__component__ function accept two argument type.  
One is function that is return React Component and this function called by props and context.  
Two is class that extends React Component and that class has props and context in instance properties.  

That's all!  

Oh, forgot one thing,
The last arguments of __comopnent__ function is component name,  
what is component name?  
React component has name which named by __function.name__ or __displayName__ property.
The __component__ function add displayName to your component to easy to debug.
