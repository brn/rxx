# DI Container

react-mvi provide google guice based DI Container.

## Usage

First create module from `AbstractModule` or `createModule` function.

Examples

```typescript
import {
  AbstractModule,
  inject
} from '@react-mvi/core';

class Foo {
  @inject()
  private bar;

  public getName() {
    return 'foo ' + this.bar.name();
  }
}

class Bar {
  @inject()
  private baz;
  public getName() {
    return 'bar ' + this.baz.name;
  }
}

class Baz {
  public name = 'baz';
}

export class Module extends AbstractModule {
  public configure() {
    this.bind('bar').to(Bar).asSingleton();
    this.bind('baz').to(Baz).asSingleton();
  }
}
```

or


```typescript
import {
  AbstractModule,
  inject
} from '@react-mvi/core';

class Foo {
  @inject()
  private bar;

  public getName() {
    return 'foo ' + this.bar.name();
  }
}

class Bar {
  @inject()
  private baz;
  public getName() {
    return 'bar ' + this.baz.name;
  }
}

class Baz {
  public name = 'baz';
}

export const module = createModule(config => {
  config.bind('bar').to(Bar).asSingleton();
  config.bind('baz').to(Baz).asSingleton();
})
```

Second, initialize injector.

Examples

```typescript
import {
  Injector
} from '@react-mvi/core';
import {
  Module,
  Foo
} from './module';

const injector = new Injector([new Module()]);
const foo = injector.getInstance(Foo);
console.log(foo.getName()) // foo bar baz
```

Above example shows injector instantiation for AbstractModule pattern.  
createModule pattern is become like below.

```typescript
import {
  Injector
} from '@react-mvi/core';
import {
  module,
  Foo
} from './module';

const injector = new Injector([module]);
const foo = injector.getInstance(Foo);
console.log(foo.getName()) // foo bar baz
```

## How does this works?

All binded dependencies in module was resolved when __getInstance__ or __get__ called.  
If your class has property decorated by __inject__ was replaced by Injector.  
And if you want to inject to parameters, see below.

```typescript
import {
  param
} from '@react-mvi/core';
class Foo {
  constructor(@param('foo') private foo)
}
```

This examples show constructor injection by param decoarator.


## Interceptor

This DI Container has interceptor, advise.  
Interceptor is able to hook process before or after method invocation.

See below.

```
import {
  intercept,
  createModule
} from '@react-mvi/core';
import {
  cmodule,
  Foo
} from './module';

export const interceptorKey = Symbol('interceptorKey');

class Foo {
  @intercept(interceptorKey)
  public doSomething(a, b) {
    return a + b;
  }
}

class FooInterceptor {
  invoke(methodInvocation) {
    console.log(methodInvocation.getArguments()); // [1, 2]
    console.log(methodInvocation.getContext()); // Foo
    console.log(methodInvocation.getInstanceName()); // 'Foo'
    console.log(methodInvocation.getPropertyName()); // 'doSomething'
    console.log(methodInvocation.getFullQualifiedName()); // 'Foo.doSomething'
    return methodInvocation.proceed() + 1;
  }
}

const module = createModule(config => {
  config.intercept(interceptorKey).to(FooInterceptor);
});

const injector = new Injector([module]);
const foo = injector.getInstance(Foo);

console.log(foo.doSomething(1, 2));
```

Result is

```javascript
[1, 2]
Foo
'Foo'
'doSomething'
'Foo.doSomething'
4
```

Above examples show intercept method _doSomething_ by intercept decorator and FooInterceptor.

## Work with react-mvi/core run or runner function.

run or runner function accept modules as arguments.

```
run({component: AnyComponent, modules: [moduleA, moduleB]})
```

If you wanna use injector, these function accept not only modules but also injector.

```
run({component: AnyComponent, injector: anyInjector});
```
