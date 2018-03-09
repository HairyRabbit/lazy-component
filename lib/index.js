/**
 * LazyComponent
 *
 * High Order Component for lazy load component by use 'import()'
 * Used for code split.
 *
 * @example
 *
 * ```js
 * <Lazy modules={{
 *   foo: import('path/to/foo.js'),
 *   bar: import('path/to/bar.js')
 * }}>
 *   {(error, modules) => {
 *     if(error) return <ErrorTemplate error={error} />
 *     return (
 *       <div>
 *         <modules.foo />
 *         <modules.bar />
 *       </div>
 *     )
 *   }}
 * </Lazy>
 * ```
 *
 * @TODOS: drop lodash, supports load spinner
 *
 * @flow
 */

import * as React from 'react'
import { eq, isPlainObject } from 'lodash'
import { PromiseMap, isPromise } from '@rabbitcc/promise-extra'

type Props = {
  modules: *,
  children: Function
}

type State = {
  loaded: boolean,
  modules: *,
  error: ?Error
}

const DefaultState: State = {
  loaded: false,
  modules: null,
  error: null
}

class LazyComponent extends React.Component<Props, State> {
  mounted: boolean = false
  state: State = DefaultState

  componentDidMount(): void {
    this.mounted = true
    this.load()
  }

  componentWillUnmount(): void {
    this.mounted = false
  }

  componentWillReceiveProps(nextProps: Props): void {
    if(eq(this.props.modules, nextProps.modules)) {
      this.load()
    }
  }

  load(): void {
    this.setState({ loaded: false })

    const modules = this.props.modules

    let promise

    if(isPlainObject(modules))       promise = PromiseMap(modules)
    else if(Array.isArray(modules))  promise = Promise.all(modules)
    else if(isPromise(modules))      promise = modules


    if(promise) {
      promise
        .then(results => {
          if (!this.mounted) return
          this.setState({
	          modules: results,
	          loaded: true
          })
        })
        .catch(error => {
          this.setState({
	          modules: null,
	          loaded: true,
	          error: error
          })
        })
    } else {
      this.setState({
        modules: null,
        loaded: true,
        error: new TypeError(`\
[LazyComponent] the argument modules should be a Promise, \
but got ${JSON.stringify(modules)}`)
      })
    }
  }

  render() {
    if (!this.state.loaded) return null
    return React.Children.only(
      this.props.children(this.state.error, this.state.modules)
    )
  }
}

export default LazyComponent
