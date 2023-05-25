import React from 'react'
import {
  ErrorBoundaryPropsWithRender,
  ErrorBoundary as ReactErrorBoundary,
} from 'react-error-boundary'
import { Warning } from './text/Text'

type Props = React.PropsWithChildren<Partial<ErrorBoundaryPropsWithRender>> & {
  reportError?: boolean
  errorText?: (error: Error) => string
}

export const ErrorBoundary = (props: Props) => {
  const { errorText, reportError = true } = props

  return (
    <ReactErrorBoundary
      {...props}
      fallbackRender={
        props.fallbackRender ||
        function ({ error }) {
          return (
            <Warning
              text={errorText ? errorText(error) : 'An error has occurred'}
            />
          )
        }
      }
      onError={(error, info) => {
        if (reportError) {
          console.warn(error)
        }
        if (props.onError) {
          props.onError(error, info)
        }
      }}
    >
      {props.children}
    </ReactErrorBoundary>
  )
}

export default ErrorBoundary
