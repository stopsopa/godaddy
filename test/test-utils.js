
// https://testing-library.com/docs/react-testing-library/setup/#custom-render

import React from 'react'
import { render } from '@testing-library/react'

import {
  BrowserRouter as Router,
} from "react-router-dom";

const AllTheProviders = ({ children }) => {
  return (
    <Router >
      {children}
    </Router>
  )
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }