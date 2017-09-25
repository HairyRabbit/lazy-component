// -*- mode: js-jsx -*-
// -*- coding: utf-8 -*-
// @flow

/**
 * LazyComponent
 *
 * High Order Component for lazy load component by use 'import()'
 *
 * Examples:
 *
 * 1. Use <LazyComponent /> for code-split.
 *
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
 */

import React, { Component }  from 'react'
import { eq, isPlainObject } from 'lodash'
import { PromiseMap }        from 'rabbit-promise-extra'

type Modules =
  | { [key: string]: Promise<*> }
  | Array<Promise<*>>
  | Promise<*>

type ResolvedModules =
  | { [key: string]: * }
  | Array<*>
  | *


type Props = {
  modules: Modules,
  children: Function
}

type State = {
  loaded: boolean,
  modules: ?ResolvedModules,
  error: ?Error
}

const DefaultState = {
  loaded: false,
  modules: null,
  error: null
}

class LazyComponent extends Component<Props, State> {
  mounted: boolean = false
  
  state = DefaultState

  componentDidMount() {
    this.mounted = true
    this.load()
  }

  componentWillUnmount() {
    this.mounted = false
  }

  componentWillReceiveProps(nextProps: Props) {
    if(eq(this.props.modules, nextProps.modules))
      this.load()
  }

  load(): void {
    this.setState({ loaded: false })

    
    let promise
    
    if(isPlainObject(this.props.modules))
      promise = PromiseMap(this.props.modules)
    else if(Array.isArray(this.props.modules))
      promise = Promise.all(this.props.modules)
    else
      promise = this.props.modules
    
    
    promise.then(results => {
      if (!this.mounted) return null
      this.setState({
	modules: results,
	loaded: true,
	error: null
      })
    }).catch(error => {
      this.setState({
	modules: null,
	loaded: true,
	error: error
      })
    })
  }

  render() {
    if (!this.state.loaded) return null
    return React.Children.only(
      this.props.children(this.state.error, this.state.modules)
    )
  }
}

export default LazyComponent

