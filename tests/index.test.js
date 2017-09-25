import React from 'react'
import { mount } from 'enzyme'
import LazyComponent from '../lib'

test('Should load component async.', (done) => {
  const wrapper = mount(
    <LazyComponent modules={{
      foo: Promise.resolve(() => <h1>foo</h1>),
      bar: Promise.resolve(() => <h2>bar</h2>)
    }}>
      {(error, modules) => (
        <div>
          <modules.foo />
          <modules.bar />
        </div>
      )}
    </LazyComponent>
  )

  process.nextTick(() => {
    expect(wrapper.find('h1').text()).toBe('foo')
    expect(wrapper.find('h2').text()).toBe('bar')
    done()
  })
})

test('Should load component async and handle errors.', (done) => {
  const error = new Error('42')
  const wrapper = mount(
    <LazyComponent modules={{
      foo: Promise.resolve(() => <h1>foo</h1>),
      bar: Promise.reject(error)
    }}>
      {(error, modules) => {
        return <h1>{error.message}</h1>
      }}
    </LazyComponent>
  )

  process.nextTick(() => {
    expect(wrapper.find('h1').text()).toBe('42')
    done()
  })
})
