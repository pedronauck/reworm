import React, { Fragment } from 'react'
import { create } from '../src/reworm'
import { shallow, mount } from 'enzyme'

describe('State', () => {
  it('should create a new state', () => {
    const state = create()

    expect(state).toBeDefined()
    expect(typeof state.get).toEqual('function')
    expect(typeof state.set).toEqual('function')
    expect(typeof state.select).toEqual('function')
  })

  it('should access state using get', () => {
    const initial = ['John', 'Michael']
    const { State, ...users } = create()
    const userList = jest.fn(s => s.map(user => <div key={user}>{user}</div>))

    const Users = () => <Fragment>{users.get(userList)}</Fragment>
    const App = () => (
      <State initial={initial}>
        <Users />
      </State>
    )

    const result = shallow(<App />)

    expect(result.html()).toBe('<div>John</div><div>Michael</div>')
    expect(userList).toHaveBeenCalled()
    expect(userList).toHaveBeenCalledWith(initial)
  })

  it('should access state using selectors', () => {
    const initial = ['John', 'Michael']
    const { State, ...users } = create()
    const usersList = jest.fn(state => state)
    const renderUser = jest.fn(users => users.map(user => <div>{user}</div>))
    const usersSelector = users.select(usersList)

    const Users = () => <Fragment>{usersSelector(renderUser)}</Fragment>

    const App = () => (
      <State initial={initial}>
        <Users />
      </State>
    )

    const result = shallow(<App />)

    expect(result.html()).toBe('<div>John</div><div>Michael</div>')
    expect(usersList).toHaveBeenCalled()
    expect(usersList).toHaveBeenCalledWith(initial)
    expect(renderUser).toHaveBeenCalled()
    expect(renderUser).toHaveBeenCalledWith(initial)
  })

  it('should modify state', () => {
    const initial = { name: 'John' }
    const { State, ...user } = create()

    const Users = () => <div>{user.get(s => s.name)}</div>
    const App = () => (
      <State initial={initial}>
        <Users />
        {user.get(s => (
          <input
            value={s.name}
            onChange={ev => user.set({ name: ev.target.value })}
          />
        ))}
      </State>
    )

    const result = mount(<App />)
    const input = result.find('input')

    input.simulate('change', { target: { value: 'Michael' } })
    expect(result.html()).toEqual('<div>Michael</div>')
  })
})
