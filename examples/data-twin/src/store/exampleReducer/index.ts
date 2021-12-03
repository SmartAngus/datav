import * as actions from './actions'
import * as selectors from './selectors'
import { Actions } from './actions'

export type State = {
  counter: number
}

const initialState: State = {
  counter: 0,
}

const exampleReducer = (state = initialState, action: Actions): State => {
  switch (action.type) {
    case actions.INCREASE_COUNTER:
      return {
        ...state,
        counter: state.counter + (action.payload.increment || 1),
      }
    case actions.DECREASE_COUNTER:
      return {
        ...state,
        counter: state.counter - (action.payload.decrement || 1),
      }
    default:
      return state
  }
}

export { actions, selectors }
export default exampleReducer
