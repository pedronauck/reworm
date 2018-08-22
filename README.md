<br />
<p align="center">
  <img src="https://cdn-std.dprcdn.net/files/acc_649651/z2M2Am" width="300" />
</p>

<p align="center">
  <img src="https://badgen.net/npm/v/reworm" />
  <img src="https://badgen.net/travis/pedronauck/reworm" />
  <img src="https://badgen.net/badge/license/MIT/blue" />
</p>

<p align="center">
  <img src="https://cdn-std.dprcdn.net/files/acc_649651/VDTl0f" width="80%"/>
</p>

## 🧐 &nbsp; Why?

Forget about actions, connections, reducers and a lot of boilerplate to create and manage states. With reworm you can create and manage state as simple as on the image above.

## 💻 &nbsp; Install and Usage

Install reworm using your package manager

```bash
$ yarn add reworm
```

Then just create your new state and use it!

```jsx
import React from 'react'
import { create } from 'reworm'

const { get } = create({ name: 'John' })

const App = () => (
  <div>{get(s => s.name)}</div>
)
```

### Change your state easily

Instead of defining actions or something else to change your state, with reworm you just need to use the `set` method like that:

```js
import React from 'react'
import { create } from 'reworm'

const { set, get } = create({ name: 'John' })

class App extends React.Component {
  componentDidMount() {
    set(prev => ({ name: 'Peter' + prev.name }))
  }
  render() {
    return (
      <div>{get(s => s.name)}</div>
    )
  }
}
```

### Using selectors

Selectors are good because they prevent you from duplicating code. With it you can just create some functions and use them throughout your application.

```jsx
import React from 'react'
import { create } from 'reworm'

const { select } = create({ list: ['Peter', 'John'] })

const johnSelector = select(state =>
  state.list.find(user => user.includes('John'))
)

const App = () => (
  <div>{johnSelector(user => user)}</div>
)
```

## 🔎 &nbsp; API

#### `create<T>(initial?: T): State`
Create a new state

#### `get((state: T) => React.ReactNode)`
Use this method to access your state

#### `set((state: T | (prevState: T) => T) => T)`
Use this method to set your state

#### `select<S = any>(selector: (state: T) => S) => (fn: GetFn<T>) => React.ReactNode`
Create selectors that can be used with your state and avoid repeating code.

```js
import React from 'react'
import { create } from 'reworm'

const { select } = create({ name: 'John' })
const userSelector = select(s => s.name)

const App = () => (
  <div>{userSelector(name => name)}</div>
)
```

## 📝 &nbsp; Typings

```ts
interface ProviderProps<T> {
  initial?: T
}

type PrevState<T> = (prevState: T) => T
type GetFn<T> = (state: T) => React.ReactNode

interface State<T> {
  get: (fn: GetFn<T>) => React.ReactNode
  set: (param: T | PrevState<T>) => void
  select: <S = any>(selector: (state: T) => S) => (fn: GetFn<S>) => React.ReactNode
}

function create<T>(initial: T) => State<T>
```

## 🕺 &nbsp; Contribute

If you want to contribute to this project, please see our [Contributing Guide](/CONTRIBUTING.md) !
