import React, { Component } from 'react'
import createContext from 'create-react-context'
import { ulid } from 'ulid'
import equal from 'fast-deep-equal'

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

type Listener = (id: string, next: any) => void

const createStore = () => {
  const listeners: Listener[] = []
  const initial: Record<string, any> = {}

  return {
    getInitial: () => initial,
    setInitial: (id: string, next: any): void => {
      initial[id] = next
    },
    subscribe: (listener: Listener): void => {
      listeners.push(listener)
    },
    unsubscribe: (listener: Listener): void => {
      listeners.splice(listeners.indexOf(listener), 1)
    },
    emit: (id: string, next: any): void => {
      for (const listener of listeners) {
        listener(id, next)
      }
    },
  }
}

const ctx = createContext<Record<string, any>>({})
const store = createStore()

interface ProviderProps {
  initial?: any
}

export class Provider extends Component<ProviderProps> {
  public state = this.props.initial || store.getInitial()
  public componentDidMount(): void {
    store.subscribe(this.handleUpdate)
  }
  public componentWillUnmount(): void {
    store.unsubscribe(this.handleUpdate)
  }
  public shouldComponentUpdate(nextProps: any, nextState: any): boolean {
    return !equal(this.state, nextState)
  }
  public render(): React.ReactNode {
    return <ctx.Provider value={this.state}>{this.props.children}</ctx.Provider>
  }

  private handleUpdate = (id: string, next: any) => {
    this.setState((prevState: any) => ({
      [id]: typeof next === 'function' ? next(prevState[id]) : next,
    }))
  }
}

export function create<T = any>(initial: T = {} as T): State<T> {
  const id = ulid()
  store.setInitial(id, initial)

  return {
    get: fn => <ctx.Consumer>{state => fn(state[id] as T)}</ctx.Consumer>,
    set: next => store.emit(id, next),
    select: selector => fn => (
      <ctx.Consumer>
        {state => {
          const select = selector(state[id] as T)
          return fn(select)
        }}
      </ctx.Consumer>
    ),
    subscribe: (fn: SubscribeFn<T>): (() => void) => {
      const sub = (selectedId: string, next: any) => {
        if (selectedId === id) fn(next)
      }

      store.subscribe(sub)
      return () => store.unsubscribe(sub)
    },
  }
}
