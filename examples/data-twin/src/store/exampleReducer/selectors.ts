import { AppState } from '../index'

export const selectCounter = (state: AppState) => state.exampleReducer.counter
