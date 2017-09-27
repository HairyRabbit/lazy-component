import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16' 
import renderer from 'react-test-renderer'
import LazyComponent from '../lib'

Enzyme.configure({ adapter: new Adapter() })

const Foo = () => (<div>foo</div>)
const Bar = () => (<div>bar</div>)

test('Should load component async.', done => {
  const component = (
    <LazyComponent modules={{
      foo: Promise.resolve(Foo),
      bar: Promise.resolve(Bar)
    }}>
      {(error, modules) => (
        <div>
          <modules.foo />
          <modules.bar />
        </div>
      )}
    </LazyComponent>
  )
  
  const wrapper  = mount(component)
  const rendered = renderer.create(component)

  let tree

  tree = rendered.toJSON()
  expect(tree).toMatchSnapshot()

  setTimeout(() => {
    tree = rendered.toJSON()
    expect(tree).toMatchSnapshot()
    
    wrapper.update()
    expect(wrapper.find(Foo).exists()).toBe(true)
    expect(wrapper.find(Bar).exists()).toBe(true)
    
    done()
  })
})

test('Should load component async and handle errors.', done => {
  const error = new Error('42')
  const component = (
    <LazyComponent modules={{
      foo: Promise.resolve(Foo),
      bar: Promise.reject(error)
    }}>
      {(error, modules) => {
        return <div id="error">{error.message}</div>
      }}
    </LazyComponent>
  )
  
  const wrapper  = mount(component)
  const rendered = renderer.create(component)

  let tree

  tree = rendered.toJSON()
  expect(tree).toMatchSnapshot()

  setTimeout(() => {
    tree = rendered.toJSON()
    expect(tree).toMatchSnapshot()

    wrapper.update()
    expect(wrapper.find(Foo).exists()).toBe(false)
    expect(wrapper.find('#error').exists()).toBe(true)
    
    done()
  }, 100)
})

test('should supports array type of modules', done => {
  const component = (
    <LazyComponent modules={[
      Promise.resolve(Foo),
      Promise.resolve(Bar)
    ]}>
      {(error, [C1, C2]) => (
        <div>
          <C1 />
          <C2 />
        </div>
      )}
    </LazyComponent>
  )
  
  const wrapper  = mount(component)
  const rendered = renderer.create(component)

  let tree

  tree = rendered.toJSON()
  expect(tree).toMatchSnapshot()

  setTimeout(() => {
    tree = rendered.toJSON()
    expect(tree).toMatchSnapshot()

    wrapper.update()
    expect(wrapper.find(Foo).exists()).toBe(true)
    expect(wrapper.find(Bar).exists()).toBe(true)
    
    done()
  }, 100)
})

test('should supports signle promise of module', done => {
  const component = (
    <LazyComponent modules={Promise.resolve(Foo)}>
      {(error, Module) => (
        <div>
          <Module />
        </div>
      )}
    </LazyComponent>
  )

  const wrapper  = mount(component)
  const rendered = renderer.create(component)

  let tree

  tree = rendered.toJSON()
  expect(tree).toMatchSnapshot()

  setTimeout(() => {
    tree = rendered.toJSON()
    expect(tree).toMatchSnapshot()

    wrapper.update()
    expect(wrapper.find(Foo).exists()).toBe(true)
    
    done()
  }, 100)
})

test('should catch error when modules is not promise', done => {
  const component = (
    <LazyComponent modules={42}>
      {(error, modules) => (
        <div>
          <div id="error">{error.message}</div>
        </div>
      )}
    </LazyComponent>
  )

  const wrapper  = mount(component)
  const rendered = renderer.create(component)

  let tree

  tree = rendered.toJSON()
  expect(tree).toMatchSnapshot()

  setTimeout(() => {
    tree = rendered.toJSON()
    expect(tree).toMatchSnapshot()
    
    wrapper.update()
    expect(wrapper.text()).toBe(`\
[LazyComponent] the argument modules should be a Promise, \
but got 42`)
    
    done()
  }, 100)
})
