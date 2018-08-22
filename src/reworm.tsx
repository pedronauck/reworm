import React, { PureComponent } from 'react'
import observe from 'callbag-observe'
import makeSubject from 'callbag-subject'
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

export function create<T = any>(initial: T = {} as T): State<T> {
  const subject = makeSubject()

  class Consumer extends PureComponent<ConsumerProps<T>> {
    public _prevState: T
    public _state: T

    constructor(props: ConsumerProps<T>) {
      super(props)
      this._state = initial
      this._prevState = initial
    }

    public componentDidMount(): void {
      const update = observe(this.update)
      update(subject)
    }
    public componentWillUnmount(): void {
      subject(2)
    }
    public render(): any {
      return this.props.children(this._state)
    }

    private update = (next: T): void => {
      const nextState = typeof next === 'function' ? next(this._state) : next
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
    set: next => subject(1, next),
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
