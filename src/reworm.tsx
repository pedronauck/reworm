import React, { Component } from 'react'
import observe from 'callbag-observe'
import makeSubject from 'callbag-subject'
import equal from 'fast-deep-equal'
import merge from 'deepmerge'

type PrevState<T> = (prevState: T) => T
type GetFn<T> = (state: T) => React.ReactNode

interface ConsumerProps<T> {
  children: (renderProps: T) => any
}

interface State<T> {
  get: (fn: GetFn<T>) => React.ReactNode
  set: (param: T | PrevState<T>) => void
  select: <S = any>(
    selector: (state: T) => S
  ) => (fn: GetFn<S>) => React.ReactNode
}

export function create<T = any>(initial: T = {} as T): State<T> {
  let STATE = initial
  const subject = makeSubject()

  class Consumer extends Component<ConsumerProps<T>> {
    public componentDidMount(): void {
      const update = observe(this.update)
      update(subject)
    }
    public componentWillUnmount(): void {
      subject(2)
    }
    public render(): any {
      return this.props.children(STATE)
    }
    private update = (next: T): void => {
      const newState = merge(STATE, next)

      if (!equal(STATE, newState)) STATE = newState
      this.setState({})
    }
  }

  return {
    get: fn => <Consumer>{fn}</Consumer>,
    set: next => {
      subject(1, typeof next === 'function' ? next(STATE) : next)
    },
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
