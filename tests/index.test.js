import React from 'react'
import { mount } from 'enzyme'
import renderer from 'react-test-renderer'
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

test('should supports array type of modules', (done) => {
  const wrapper = mount(
    <LazyComponent modules={[
      Promise.resolve(() => <h1>foo</h1>),
      Promise.resolve(() => <h2>bar</h2>)
    ]}>
      {(error, [Foo, Bar]) => (
        <div>
          <Foo />
          <Bar />
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

test('should supports signle promise of module', (done) => {
  const wrapper = mount(
    <LazyComponent modules={Promise.resolve(() => <h1>foo</h1>)}>
      {(error, Module) => (
        <div>
          <Module />
        </div>
      )}
    </LazyComponent>
  )

  process.nextTick(() => {
    expect(wrapper.find('h1').text()).toBe('foo')
    done()
  })
})

test('should throw error when modules is not promise', (done) => {
  function throwTest() {
    const wrapper = mount(
        <LazyComponent modules={42}>
        {(error, modules) => (
            <div>
            <modules />
            </div>
        )}
      </LazyComponent>
    )
  }

  process.nextTick(() => {
    expect(throwTest).toThrow()
    done()
  })
})


/// Snapshots 

test('snapshots renders', (done) => {
  const component = renderer.create(
    <LazyComponent modules={Promise.resolve(() => <h1>foo</h1>)}>
      {(error, Module) => (
        <div>
          <Module />
        </div>
      )}
    </LazyComponent>
  )

  let tree

  tree = component.toJSON()
  expect(tree).toMatchSnapshot()

  process.nextTick(() => {
    tree = component.toJSON()
    expect(tree).toMatchSnapshot()
    done()
  })
})
