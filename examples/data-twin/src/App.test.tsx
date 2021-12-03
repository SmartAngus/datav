import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import App from './App'
import configureStore from './store'

const store = configureStore()

test('renders qte-create-react-app-template', () => {
  const { getByText } = render(
    <Provider store={store}>
      <App />
    </Provider>
  )

  expect(getByText(/qte create-react-app-template/i)).toBeInTheDocument()
})
