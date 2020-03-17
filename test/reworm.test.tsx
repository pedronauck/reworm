import React, { Component, Fragment, useEffect, FC, useState } from 'react'
import { create, Provider, useReworm } from '../src/reworm'
import { shallow, mount, render } from 'enzyme'

describe('State', () => {
  it('should create a new state', () => {
    const state = create('newState')

    expect(state).toBeDefined()
    expect(typeof state.get).toEqual('function')
    expect(typeof state.set).toEqual('function')
    expect(typeof state.select).toEqual('function')
  })

  it('should access state using get', () => {
    const initial = ['John', 'Michael']
    const users = create('userStore', initial)
    const userList = jest.fn(s =>
      s.map((user: any) => <div key={user}>{user}</div>)
    )

    const Users = () => <Fragment>{users.get(userList)}</Fragment>
    const App = () => (
      <Provider>
        <Users />
      </Provider>
    )

    const result = shallow(<App />)

    expect(result.html()).toBe('<div>John</div><div>Michael</div>')
    expect(userList).toHaveBeenCalled()
    expect(userList).toHaveBeenCalledWith(initial)
  })

  it('should access state using selectors', () => {
    const initial = { list: ['John', 'Michael'] }
    const users = create('userStore', initial)
    const usersList = jest.fn(state => state.list)
    const renderUser = jest.fn(users =>
      users.map((user: any) => <div key={user}>{user}</div>)
    )
    const usersSelector = users.select(usersList)

    const johnSelector = users.select(s =>
      s.list.find((u: any) => u.includes('John'))
    )

    const Users = () => <Fragment>{usersSelector(renderUser)}</Fragment>
    const John = () => <Fragment>{johnSelector((u: any) => u)}</Fragment>

    const App = () => (
      <Provider>
        <Fragment>
          <Users />
          <John />
        </Fragment>
      </Provider>
    )

    const result = shallow(<App />)

    expect(result.html()).toBe('<div>John</div><div>Michael</div>John')
    expect(usersList).toHaveBeenCalled()
    expect(usersList).toHaveBeenCalledWith(initial)
    expect(renderUser).toHaveBeenCalled()
    expect(renderUser).toHaveBeenCalledWith(initial.list)
  })

  it('should modify state', () => {
    const initial = { name: 'John' }
    const user = create('userStore', initial)

    const Users = () => <div>{user.get(s => s.name)}</div>

    const App: FC = () => {
      const { set, get } = useReworm('userStore')
      useEffect(() => {
        set({ name: 'Peter' })
      }, [])

      return (
        <Provider>
          <div>
            <Users />
            {get(s => (
              <input
                type="text"
                value={s.name || ''}
                onChange={ev => set({ name: ev.target.value })}
              />
            ))}
          </div>
        </Provider>
      )
    }

    const result = mount(<App />)
    const input = result.find('input')
    input.simulate('change', { target: { value: 'Michael' } })

    expect(result.html()).toEqual(
      '<div><div>Michael</div><input type="text" value="Michael"></div>'
    )
  })

  it('should modify state with primitive types', () => {
    const initial = 'John'
    const user = create('userStore', initial)

    const Users = () => <div>{user.get(val => val)}</div>
    const App = () => (
      <Provider>
        <div>
          <Users />
          {user.get((val: string) => (
            <input
              type="text"
              value={val || ''}
              onChange={ev => user.set(ev.target.value)}
            />
          ))}
        </div>
      </Provider>
    )

    const result = mount(<App />)
    const input = result.find('input')

    input.simulate('change', { target: { value: 'Michael' } })

    expect(result.html()).toEqual(
      '<div><div>Michael</div><input type="text" value="Michael"></div>'
    )
  })

  it('should trigger subscribe function', () => {
    const initial = 'John'
    const user = create('userStore', initial)

    class App extends Component {
      public state = { name: null }
      public componentDidMount(): void {
        user.subscribe(name => this.setState({ name }))
        user.set('Michael')
      }
      public render(): React.ReactNode {
        return <div>Hello {this.state.name}</div>
      }
    }

    const result = mount(<App />)

    expect(result.html()).toEqual('<div>Hello Michael</div>')
  })

  it('should be able to retrieve the state from a store using hooks', () => {
    const initial = ['John', 'Michael']
    const users = create('userStore', initial)

    const userList = jest.fn(s =>
      s.map((user: any) => <div key={user}>{user}</div>)
    )

    const Users = () => {
      const { get } = useReworm('userStore')
      return <Fragment>{get(userList)}</Fragment>
    }

    const App = () => (
      <Provider>
        <Users />
      </Provider>
    )

    const result = shallow(<App />)

    expect(result.html()).toBe('<div>John</div><div>Michael</div>')
    expect(userList).toHaveBeenCalled()
    expect(userList).toHaveBeenCalledWith(initial)
  })

  it('should access the state using hooks and selectors', () => {
    const initial = { list: ['John', 'Michael'] }
    const users = create('userStore', initial)
    const usersList = jest.fn(state => state.list)
    const renderUser = jest.fn(users =>
      users.map((user: any) => <div key={user}>{user}</div>)
    )

    const Users = () => {
      const { select } = useReworm('userStore')
      const usersSelector = select(usersList)
      return <Fragment>{usersSelector(renderUser)}</Fragment>
    }
    const John = () => {
      const { select } = useReworm('userStore')

      const johnSelector = select(s =>
        s.list.find((u: any) => u.includes('John'))
      )

      return <Fragment>{johnSelector((u: any) => u)}</Fragment>
    }

    const App = () => (
      <Provider>
        <Fragment>
          <Users />
          <John />
        </Fragment>
      </Provider>
    )

    const result = shallow(<App />)

    expect(result.html()).toBe('<div>John</div><div>Michael</div>John')
    expect(usersList).toHaveBeenCalled()
    expect(usersList).toHaveBeenCalledWith(initial)
    expect(renderUser).toHaveBeenCalled()
    expect(renderUser).toHaveBeenCalledWith(initial.list)
  })

  it('should modify state with hooks', () => {
    const initial = 'John'
    const user = create('userStore', initial)

    const Users = () => {
      const { get } = useReworm('userStore')
      return <div>{get(val => val)}</div>
    }

    const App = () => {
      const { set } = useReworm('userStore')
      useEffect(() => {
        set('Michael')
      }, [])
      return (
        <Provider>
          <div>
            <Users />
          </div>
        </Provider>
      )
    }

    const result = mount(<App />)

    expect(result.html()).toEqual('<div><div>Michael</div></div>')
  })

  it('should trigger subscribe function', () => {
    const initial = 'John'
    const user = create('userStore', initial)

    const App = () => {
      const [name, setName] = useState('')
      const { subscribe, set } = useReworm('userStore')
      useEffect(() => {
        subscribe(name => setName(name))
        set('Michael')
      }, [])

      return <div>Hello {name}</div>
    }

    const result = mount(<App />)

    expect(result.html()).toEqual('<div>Hello Michael</div>')
  })

  it('should unmount Provider', () => {
    const user = create('userStore')

    const App = () => <Provider />

    const result = mount(<App />)
    const unmount = result.unmount()

    expect(typeof unmount).toBe('object')
  })
})
