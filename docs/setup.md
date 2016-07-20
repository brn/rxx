# Setup

## For jspm users

### Install jspm 1.7

react-mvi use jspm 1.7 beta, so you need to install jspm 1.7.

```
npm install jspm@beta -g
```

### Setup

react-mvi use scoped package and jspm treat scoped package as namespace,  
so you need install react-mvi as below.

```
jspm install @react-mvi/core=npm:@react-mvi/core
jspm install @react-mvi/http=npm:@react-mvi/http
jspm install @react-mvi/event=npm:@react-mvi/event
```


## For webpack or other npm based module system users

react-mvi has cjs style modules, so only you need is simply install via npm.

```
npm install @react-mvi/core @react-mvi/http @react-mvi/event
```

After installed, set package path to /cjs, because there are cjs modules under the /cjs directory.


## For typescript users

### typing and jspm

#### typescript version <= 1.9

react-mvi written by typescript so typing is not need.  
But typescript <= 1.9 hasn't jspm based module resolution system.  
So you need to install react-mvi via npm too.  
And set _moduleResolution_ option to "_node_".

#### typescript version >= 2.0

Typescript version >= 2.0 has path mapping options.  
So you need is simply set _baseUrl_ and _paths_ options as below.

```json
{
  "baseUrl": "./",
  "paths": {
    "@react-mvi/core": ["jspm_packages/npm/@react-mvi/core@0.3.6/index.tsx"],
    "@react-mvi/http": ["jspm_packages/npm/@react-mvi/http@0.3.5/index.ts"],
    "@react-mvi/event": ["jspm_packages/npm/@react-mvi/event@0.3.5/index.ts"]
  }
}
```
