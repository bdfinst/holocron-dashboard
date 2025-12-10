import { BrowserRouter as Router } from 'react-router-dom'
import { render, renderHook, screen } from '@testing-library/react'
import { useTheme } from '@mui/material'
import localStorageConfig from 'localStorageConfig'
import * as localStorage from 'local-storage'
import userEvent from '@testing-library/user-event'

jest.mock('./OpenSans-Regular.ttf', () => 'Open Sans Font')

const initDOM = document.body.innerHTML
// mocking body for nonce
document.body.innerHTML = `<meta property="csp-nonce" content="HOLOCRON_NONCE" />`

// then importing what reads the nonce
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ThemeWrapper = require('.').default
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useColorModeContext } = require('.')

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeWrapper>
    <Router>{children}</Router>
  </ThemeWrapper>
)
const MockComponent = () => {
  const theme = useTheme()
  const { toggleColorMode } = useColorModeContext()

  return (
    <>
      <button
        data-testid="toggle-theme"
        onClick={toggleColorMode}
        type="button"
      />
      <div data-testid="theme-mode">{theme.palette.mode}</div>
    </>
  )
}

afterAll(() => {
  document.body.innerHTML = initDOM
})

describe('ThemeWrapper', () => {
  it('should render with dark mode as default', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: Providers,
    })
    const theme = result.current
    expect(theme.palette.mode).toEqual('dark')
  })

  it('should render with mode in local storage if local storage is set', () => {
    localStorage.set(localStorageConfig.THEME, 'light')

    const { result } = renderHook(() => useTheme(), {
      wrapper: Providers,
    })
    const theme = result.current
    expect(theme.palette.mode).toEqual('light')
  })

  it('should set theme to dark (with local storage) if set to light on toggle', async () => {
    localStorage.set(localStorageConfig.THEME, 'light')

    render(
      <Providers>
        <MockComponent />
      </Providers>,
    )

    await userEvent.click(screen.getByTestId('toggle-theme'))

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light')
    expect(localStorage.get(localStorageConfig.THEME)).toEqual('light')
  })

  it('should set theme to light (with local storage) if set to dark on toggle', async () => {
    localStorage.set(localStorageConfig.THEME, 'dark')

    render(
      <Providers>
        <MockComponent />
      </Providers>,
    )

    await userEvent.click(screen.getByTestId('toggle-theme'))

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark')
    expect(localStorage.get(localStorageConfig.THEME)).toEqual('dark')
  })
})
