import React from 'react'
import * as Sentry from '@sentry/react'
import config, { getFlavor } from '../config'
const SENTRY_ENABLED = config.SENTRY_DSN && config.SENTRY_ENABLED === '1'

const init = () => {
  if (SENTRY_ENABLED) {
    Sentry.init({
      dsn: config.SENTRY_DSN,
      environment: getFlavor(),
    })
  }
}

const ErrorBoundary: React.FC = ({ children }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={undefined}
      children={children}
    />
  )
}

const createReduxEnhancer = Sentry.createReduxEnhancer

const captureException = Sentry.captureException
const captureMessage = Sentry.captureMessage

export {
  init,
  ErrorBoundary,
  createReduxEnhancer,
  captureException,
  captureMessage,
}
