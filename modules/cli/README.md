# @react-mvi/cli

## What's this?

`@react-mvi/cli` is command line tools for `@react-mvi`.

Now we support below commands.

- init
- update
- dev
- build
- install


## install

```
npm install @react-mvi/cli -g
```

## Usage

```
rmvi init
```


### init

Create new Project on current directory.

```
rmvi init
```


### update

Update `@react-mvi` namespace packages.

```
rmvi build
```


### dev

Launch webpack-dev-server.

```
rmvi dev
```


### build

Build current project with webpack.

```
rmvi build
```

### install

Install new dependencies by use npm or yarn which decided when init.

```
rmvi install react-router
rmvi i react-router -D
rmvi i react-router --dev
rmvi i react-router --peer
```
