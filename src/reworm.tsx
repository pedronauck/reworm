import React, {
  FC,
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  useContext,
} from 'react'

export type PrevState<T> = (prevState: T) => T
export type GetFn<T> = (state: T) => React.ReactNode
export type SubscribeFn<T> = (state: T) => any

export interface State<T> {
  get: (fn: GetFn<T>) => React.ReactNode
  set: (next: T | PrevState<T>) => void
  select: <S = any>(
    selector: (state: T) => S
  ) => (fn: GetFn<S>) => React.ReactNode
  subscribe: (fn: SubscribeFn<T>) => () => void
}

export type Listener = (storeName: string, next: any) => void

const createStore = () => {
  const listeners: Listener[] = []
  const initial: Record<string, any> = {}

  return {
    getInitial: () => initial,
    setInitial: (storeName: string, next: any): void => {
      initial[storeName] = next
    },
    subscribe: (listener: Listener): void => {
      listeners.push(listener)
    },
    unsubscribe: (listener: Listener): void => {
      listeners.splice(listeners.indexOf(listener), 1)
    },
    emit: (storeName: string, next: any): void => {
      for (const listener of listeners) {
        listener(storeName, next)
      }
    },
  }
}

const store = createStore()
const ctx = createContext<Record<string, any>>({})

function usePrevious<T extends any>(value: T): any {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

export const Provider: FC = props => {
  const [state, setState] = useState(store.getInitial())

  const prevState = usePrevious(state)

  const handleUpdate = useCallback(
    (storeName: string, next: any) => {
      setState({
        [storeName]:
          typeof next === 'function' ? next(prevState[storeName]) : next,
      })
    },
    [state, setState]
  )

  useEffect(() => {
    store.subscribe(handleUpdate)

    return () => {
      store.unsubscribe(handleUpdate)
    }
  }, [store])

  return useMemo(
    () => <ctx.Provider value={state}>{props.children}</ctx.Provider>,
    [props, state]
  )
}

export function create<T extends any>(
  storeName: string,
  initial: T = {} as T
): State<T> {
  store.setInitial(storeName, initial)

  return {
    get: fn => (
      <ctx.Consumer>{state => fn(state[storeName] as T)}</ctx.Consumer>
    ),
    set: next => store.emit(storeName, next),
    select: selector => fn => (
      <ctx.Consumer>
        {state => {
          const select = selector(state[storeName] as T)
          return fn(select)
        }}
      </ctx.Consumer>
    ),
    subscribe: (fn: SubscribeFn<T>): (() => void) => {
      const sub = (selectedId: string, next: any) => {
        if (selectedId === storeName) fn(next)
      }

      store.subscribe(sub)
      return () => store.unsubscribe(sub)
    },
  }
}

export function useReworm<T extends any>(storeName: string): State<T> {
  const state = useContext(ctx)

  return {
    get: fn => (
      <ctx.Consumer>{state => fn(state[storeName] as T)}</ctx.Consumer>
    ),
    set: next => store.emit(storeName, next),
    select: selector => fn => {
      const select = selector(state[storeName] as T)
      return fn(select)
    },
    subscribe: (fn: SubscribeFn<T>): (() => void) => {
      const sub = (selectedId: string, next: any) => {
        if (selectedId === storeName) fn(next)
      }

      store.subscribe(sub)
      return () => store.unsubscribe(sub)
    },
  }
}
