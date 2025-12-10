import { render, screen } from '@testing-library/react'
import HolocronLoadingScreen from './HolocronLoadingScreen'

describe('HolocronLoadingScreen', () => {
  it('should render full screen by default', () => {
    render(<HolocronLoadingScreen />)
    const loadingScreen = screen.getByTestId('holocron-loading-screen')
    expect(loadingScreen).toBeInTheDocument()
    expect(loadingScreen).toHaveStyle('min-height: 100vh')
  })

  it('should render in a non-fullscreen mode when fullScreen is false', () => {
    render(<HolocronLoadingScreen fullScreen={false} />)
    const loadingScreen = screen.getByTestId('holocron-loading-screen')
    expect(loadingScreen).toHaveStyle('min-height: 100%')
    expect(loadingScreen).toHaveStyle('position: absolute')
  })

  it('should not render the logo when showLogo is false', () => {
    render(<HolocronLoadingScreen showLogo={false} />)
    expect(
      screen.queryByAltText('Holocron Logo Loading'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByAltText('Holocron Icon Loading'),
    ).not.toBeInTheDocument()
  })

  it('should render the correct loading text', () => {
    const customText = 'Custom loading message...'
    render(<HolocronLoadingScreen text={customText} />)
    expect(screen.getByText(customText)).toBeInTheDocument()
  })

  it('should render with visibility controlled by the visible prop', () => {
    const { rerender } = render(<HolocronLoadingScreen visible={false} />)
    const loadingScreen = screen.getByTestId('holocron-loading-screen')
    expect(loadingScreen).toHaveStyle('opacity: 0')
    expect(loadingScreen).toHaveStyle('visibility: hidden')

    rerender(<HolocronLoadingScreen visible />)
    expect(loadingScreen).toHaveStyle('opacity: 1')
    expect(loadingScreen).toHaveStyle('visibility: visible')
  })
})
