<br />
<p align="center">
  <img src="https://cdn-std.dprcdn.net/files/acc_649651/LAevjl" width="300" />
</p>

<p align="center">
  <img src="https://badgen.net/npm/v/reworm" />
  <img src="https://badgen.net/travis/pedronauck/reworm" />
  <img src="https://badgen.net/badge/license/MIT/blue" />
</p>

<p align="center">
  <img src="https://cdn-std.dprcdn.net/files/acc_649651/UtUFi5" width="80%"/>
</p>

## 🧐 &nbsp; Why?

Forget about actions, connections, reducers and a lot of boilerplate to create and manage states. With reworm you can create and manage state simple as the image above.

## 💻 &nbsp; Install and Usage

Install reworm using your package manager

```bash
$ yarn add reworm
```

Then just create your new state and use it!

```jsx
import React from 'react'
import { create } from 'reworm'

const { State, get } = create({ name: 'John' })

const App = () => (
  <State>
    <div>{get(s => s.name)}</div>
  </State>
)
```

### Change your state easily

Instead of define actions or something else to change your state, with reworm you just need to use `set` method like that:

```js
import React from 'react'
import { create } from 'reworm'

const { State, set, get } = create({ name: 'John' })

class App extends React.Component {
  componentDidMount() {
    set(prev => ({ name: 'Peter' + prev.name }))
  }
  render() {
    return (
      <State>
        <div>{get(s => s.name)}</div>
      </State>
    )
  }
}
```

### Using selectors

Selectors are good because avoid the need to repeat code, with it you can just create some functions and use them across your aplication.

```jsx
import React from 'react'
import { create } from 'reworm'

const { State, select } = create({ list: ['Peter', 'John'] })

const johnSelector = select(s =>
  s.list.filter(user => user.includes('Peter'))
)

const App = () => (
  <State>
    <div>{johnSelector(user => user)}</div>
  </State>
)
```

## 🔎 &nbsp; API

#### `create<T>(initial?: T): State`
Create a new state

#### `State<T>: ReactComponent<{ initial?: T }>`
Use this component as wrapper when you want to access your state

#### `get((state: T) => React.ReactNode)`
Use this method to access your state

#### `set((state: T | (prevState: T) => T) => T)`
Use this method to set your state

#### `select(selector: (state: T) => T) => (fn: GetFn<T>) => React.ReactNode`
Create selectors that can be used with your state and avoid repeating code.

```js
import React from 'react'
import { create } from 'reworm'

const { State, select } = create({ name: 'John' })
const userSelector = select(s => s.name)

const App = () => (
  <State>
    {userSelector}
  </State>
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
  select: (selector: (state: T) => T) => (fn: GetFn<T>) => React.ReactNode
  State: React.ComponentType<ProviderProps<T>>
}

function create<T>(initial: T) => State<T>
```

## 🕺 &nbsp; Contribute

If you want to contribute to this project, please see our [Contributing Guide](/CONTRIBUTING.md) !
