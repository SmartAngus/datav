export const INCREASE_COUNTER = 'exampleReducer/INCREASE_CONTER'

export type IncreaseAction = {
  type: typeof INCREASE_COUNTER
  payload: {
    increment?: number
  }
}
export const increaseAction = (increment?: number): IncreaseAction => ({
  type: INCREASE_COUNTER,
  payload: {
    increment: increment,
  },
})

export const DECREASE_COUNTER = 'exampleReducer/DECREASE_COUNTER'

export type DecreaseAction = {
  type: typeof DECREASE_COUNTER
  payload: {
    decrement?: number
  }
}
export const decreaseAction = (decrement?: number): DecreaseAction => ({
  type: DECREASE_COUNTER,
  payload: {
    decrement: decrement,
  },
})

export type Actions = IncreaseAction | DecreaseAction
