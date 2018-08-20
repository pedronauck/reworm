import React, { Component } from 'react'
import observe from 'callbag-observe'
import makeSubject from 'callbag-subject'
import createContext from 'create-react-context'

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

export function create<T = any>(initial: T = {} as T): State<T> {
  const subject = makeSubject()
  const { Provider, Consumer } = createContext<T>(initial)
  const get = (fn: GetFn<T>) => <Consumer>{fn}</Consumer>

  return {
    get,
    set: fn => subject(1, fn),
    select: selector => fn => (
      <Consumer>
        {state => {
          const select = selector(state)
          return fn(select)
        }}
      </Consumer>
    ),
    State: class CustomProvider extends Component<ProviderProps<T>, T> {
      public state: T = this.props.initial || initial
      public componentDidMount(): void {
        observe((v: T) => this.setState(v))(subject)
      }
      public componentWillUnmount(): void {
        subject(2)
      }
      public render(): React.ReactNode {
        return <Provider value={this.state}>{this.props.children}</Provider>
      }
    },
  }
}
