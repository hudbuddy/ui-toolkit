/**
 * A registry of components to circumvent circular dependencies.
 *
 * Note: This does not include all components
 */

import React from 'react'

const components = {} as { [name: string]: React.FunctionComponent }

export function registerComponent(
  name: string,
  Component: React.FunctionComponent,
) {
  components[name] = Component
}

export function ItemFactory(props) {
  const C = components[props.type]
  return <C {...props} />
}
