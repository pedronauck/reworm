import React, { PureComponent } from 'react'
import equal from 'fast-deep-equal'

const isPrimitive = (test: any) => test !== Object(test)

type PrevState<T> = (prevState: T) => T
type GetFn<T> = (state: T) => React.ReactNode

interface ConsumerProps<T> {
  children: (renderProps: T) => any
}

interface State<T> {
  get: (fn: GetFn<T>) => React.ReactNode
  set: (next: T | PrevState<T>) => void
  select: <S = any>(
    selector: (state: T) => S
  ) => (fn: GetFn<S>) => React.ReactNode
}

const createEmitter = () => {
  let listeners: Array<Function> = []
  return {
    subscribe: (listener: Function): void => {
      listeners.push(listener)
    },
    unsubscribe: (listener: Function): void => {
      listeners.splice(listeners.indexOf(listener), 1)
    },
    emit: (event: any): void => {
      listeners.forEach(listener => listener(event))
    },
  }
}

export function create<T = any>(initial: T = {} as T): State<T> {
  const { subscribe, unsubscribe, emit } = createEmitter()

  class Consumer extends PureComponent<ConsumerProps<T>> {
    public _prevState: T
    public _state: T

    constructor(props: ConsumerProps<T>) {
      super(props)
      this._state = initial
      this._prevState = initial
    }

    public componentDidMount(): void {
      subscribe(this.update)
    }
    public componentWillUnmount(): void {
      unsubscribe(this.update)
    }
    public render(): any {
      return this.props.children(this._state)
    }

    private update = (next: any): void => {
      const nextState: T = typeof next === 'function' ? next(this._state) : next

      const newState = !isPrimitive(nextState)
        ? Object.assign({}, this._state, nextState)
        : nextState

      const isEqual = !isPrimitive(newState)
        ? equal(this._state, newState)
        : this._state === newState

      if (!isEqual) {
        this._prevState = this._state
        this._state = newState
        this.forceUpdate()
      }
    }
  }

  return {
    get: fn => <Consumer>{fn}</Consumer>,
    set: emit,
    select: selector => fn => (
      <Consumer>
        {state => {
          const select = selector(state)
          return fn(select)
        }}
      </Consumer>
    ),
  }
}
