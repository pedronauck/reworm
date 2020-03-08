<br />
<p align="center">
  <img src="https://cdn-std.dprcdn.net/files/acc_649651/z2M2Am" width="300" />
</p>

<p align="center">
  <img src="https://badgen.net/npm/v/reworm" />
  <img src="https://badgen.net/travis/pedronauck/reworm" />
  <img src="https://badgen.net/badge/license/MIT/blue" />
</p>

## 🧐 &nbsp; Why?

Forget about actions, connections, reducers and a lot of boilerplate to create and manage states. With reworm you can create and manage state as simple as on the image above.

### [Todo List Example](https://codesandbox.io/s/405lzj6m84)

## 💻 &nbsp; Install and Usage

Install reworm using your package manager

```bash
$ yarn add reworm
```

Then just wrap your app with our `Provider`, create your new state and use it!

```jsx
import React from 'react'
import { Provider, create } from 'reworm'

const { get } = create('userStore', { name: 'John' })

const App = () => (
  <Provider>
    <div>{get(s => s.name)}</div>
  </Provider>
)
```

### Change your state easily

Instead of defining actions or something else to change your state, with reworm you just need to use the `set` method like that:

```js
import React from 'react'
import { Provider, create } from 'reworm'

const { set, get } = create('userStore', { name: 'John' })

class App extends React.Component {
  componentDidMount() {
    set(prev => ({ name: 'Peter' + prev.name }))
  }
  render() {
    return (
      <Provider>
        <div>{get(s => s.name)}</div>
      </Provider>
    )
  }
}
```

### Using selectors

Selectors are good because they prevent you from duplicating code. With it you can just create some functions and use them throughout your application.

```jsx
import React from 'react'
import { Provider, create } from 'reworm'

const { select } = create('userStore', { list: ['Peter', 'John'] })

const johnSelector = select(state =>
  state.list.find(user => user.includes('John'))
)

const App = () => (
  <Provider>
    <div>{johnSelector(user => user)}</div>
  </Provider>
)
```

### Listening state changes

If you want to listen changes on your state you can use `subscribe()`:

```jsx
import React from 'react'
import { Provider, create } from 'reworm'

const user = create('userStore')

class App extends Component {
  state = {
    name: 'John'
  }

  componentDidMount() {
    user.subscribe(name => this.setState({ name }))
    user.set('Michael')
  }

  render() {
    return <div>Hello {this.state.name}</div>
  }
}
```

### Hooks 

If you want to use hooks you can use the `useReworm`:

```jsx
import React, { useEffect } from 'react'
import { Provider, create, useReworm } from 'reworm'

const store = create('userStore', { name: 'John' })

const App = () => {
  const { get, set } = useReworm('userStore')
  useEffect(() => {
    set(prev => ({ name: 'Peter' + prev.name }))
  }, []);

  return (
    <Provider>
      <div>{get(s => s.name)}</div>
    </Provider>
  )
}
```

## 🔎 &nbsp; API

#### `create<T>(storeName: string, initial?: T): State`
Create a new state

#### `get((state: T) => React.ReactNode)`
Use this method to access your state

#### `set((state: T | (prevState: T) => T) => T)`
Use this method to set your state

#### `select<S = any>(selector: (state: T) => S) => (fn: GetFn<T>) => React.ReactNode`
Create selectors that can be used with your state and avoid repeating code.

#### `subscribe: (fn: SubscribeFn<T>) => () => void`
Use this method to listen state changes

## 📝 &nbsp; Typings

```ts
type PrevState<T> = (prevState: T) => T
type GetFn<T> = (state: T) => React.ReactNode
type SubscribeFn<T> = (state: T) => any

interface State<T> {
  get: (fn: GetFn<T>) => React.ReactNode
  set: (next: T | PrevState<T>) => void
  select: <S = any>(
    selector: (state: T) => S
  ) => (fn: GetFn<S>) => React.ReactNode
  subscribe: (fn: SubscribeFn<T>) => () => void
}

function create<T>(storeName: string, initial: T) => State<T>
```

## 🕺 &nbsp; Contribute

If you want to contribute to this project, please see our [Contributing Guide](/CONTRIBUTING.md) !
