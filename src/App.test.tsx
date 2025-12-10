import React from 'react'
import { render, screen } from '@testing-library/react'
import globalConfig from 'globalConfig'
import App from 'App'

// eslint-disable-next-line no-console
const initErrLogger = console.error

jest.mock('ui/Main', () => ({
  __esModule: true,
  default: () => {
    throw new Error('oops.')
  },
}))

jest.mock('utils/ThemeWrapper', () => ({
  __esModule: true,
  default: props => <>{props.children}</>,
}))

beforeAll(() => {
  // ignore errors
  // eslint-disable-next-line no-console
  console.error = jest.fn()
})

afterAll(() => {
  // setting the error logger back to
  // be logged by third party libraries.
  // eslint-disable-next-line no-console
  console.error = initErrLogger
})

describe('Error Boundary', () => {
  it('should load the fallback error message if some unknown error occurs', () => {
    render(<App />)

    const unknownIssueHeader = screen.getByLabelText('Unknown Issue Title')
    expect(unknownIssueHeader).toBeInTheDocument()
    expect(
      screen.getByText(globalConfig.UI_SETTINGS.APP_UNKNOWN_ERR_MSG),
    ).toBeInTheDocument()
  })
})
