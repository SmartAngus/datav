import {
  createStore,
  combineReducers,
  applyMiddleware,
  Middleware,
  compose,
} from 'redux'
import { devToolsEnhancer } from 'redux-devtools-extension'
import { createReduxEnhancer as sentryReduxEnhancer } from '../sentry'
import exampleReducer from './exampleReducer'

const rootReducer = combineReducers({
  exampleReducer: exampleReducer,
})

export type AppState = ReturnType<typeof rootReducer>

export default function configureStore() {
  const middlewares: Middleware[] = []
  const middleWareEnhancer = applyMiddleware(...middlewares)

  const store = createStore(
    rootReducer,
    compose(
      middleWareEnhancer,
      sentryReduxEnhancer(),
      devToolsEnhancer({
        trace: true,
      })
    )
  )

  return store
}
