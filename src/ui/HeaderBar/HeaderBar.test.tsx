import { screen, waitFor } from '@testing-library/react'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import { useColorModeContext } from 'utils/ThemeWrapper'
import HeaderBar from '.'

jest.mock('local-storage')

jest.mock('utils/Help', () => ({
  __esModule: true,
  default: () => <div />,
}))

jest.mock('utils/ThemeWrapper', () => ({
  useColorModeContext: jest.fn(),
}))

jest.mock('./infoContent.md', () => 'info content')

const useColorModeContextMock = useColorModeContext as jest.Mock

describe('Header bar', () => {
  beforeEach(() => {
    useColorModeContextMock.mockReturnValue({
      toggleColorMode: jest.fn(),
    })
  })

  it('Logo should be in the header', () => {
    RenderWithWrapper(<HeaderBar onClick={jest.fn()} open={false} />)
    const icon = screen.getByLabelText('Holocron Logo')
    expect(icon).toBeInTheDocument()
  })

  it('Should call onClick method when hamburger button is pressed', async () => {
    const onClick = jest.fn()

    RenderWithWrapper(<HeaderBar onClick={onClick} open={false} />)

    const button = screen.getByLabelText(/open drawer/i)
    expect(button).toBeInTheDocument()
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('Should call toggleColorMode when the theme switch is toggled', async () => {
    const toggleColorMode = jest.fn()
    useColorModeContextMock.mockReturnValue({
      toggleColorMode,
    })

    RenderWithWrapper(<HeaderBar onClick={jest.fn()} open={false} />)

    const toggle = screen.getByLabelText('Light Mode')
    await userEvent.click(toggle)
    expect(toggleColorMode).toHaveBeenCalledTimes(1)
  })

  it('Should redirect to /admin when we press configuration', async () => {
    RenderWithWrapper(null, { initialEntries: ['/'] }, [
      <Route
        key="home"
        path="/"
        element={<HeaderBar onClick={jest.fn()} open={false} />}
      />,
      <Route key="admin" path="/admin" element={<div>Admin Page</div>} />,
    ])

    const linkToAdmin = screen.getByRole('button', { name: 'Configuration' })
    await userEvent.click(linkToAdmin)
    await waitFor(() => {
      expect(screen.getByText('Admin Page')).toBeInTheDocument()
    })
  })
})

describe('Header Title', () => {
  it('should render with Reports for reports path', () => {
    RenderWithWrapper(<HeaderBar onClick={jest.fn()} open={false} />, {
      initialEntries: ['/reports'],
    })
    expect(screen.getByLabelText('Desktop View Page Title')).toHaveTextContent(
      'Reports',
    )
    expect(screen.getByLabelText('Mobile View Page Title')).toHaveTextContent(
      'Reports',
    )
  })

  it('should render with Configuration for /admin path', () => {
    RenderWithWrapper(<HeaderBar onClick={jest.fn()} open={false} />, {
      initialEntries: ['/admin'],
    })
    expect(screen.getByLabelText('Desktop View Page Title')).toHaveTextContent(
      'Configuration',
    )
    expect(screen.getByLabelText('Mobile View Page Title')).toHaveTextContent(
      'Configuration',
    )
  })

  it('should render with Delivery Metrics for default path', () => {
    RenderWithWrapper(<HeaderBar onClick={jest.fn()} open={false} />, {
      initialEntries: ['/'],
    })
    expect(screen.getByLabelText('Desktop View Page Title')).toHaveTextContent(
      'Delivery Metrics',
    )
    expect(screen.getByLabelText('Mobile View Page Title')).toHaveTextContent(
      'Delivery Metrics',
    )
  })
  describe('SwitchThemeButton Button Group', () => {
    beforeEach(() => {
      useColorModeContextMock.mockReturnValue({
        toggleColorMode: jest.fn(),
      })
    })
    it('should render the button', () => {
      useColorModeContextMock.mockReturnValue({
        toggleColorMode: jest.fn(),
        isGrayScale: false,
        colorMode: 'light',
      })

      RenderWithWrapper(<HeaderBar onClick={jest.fn()} open={false} />)

      const button = screen.getByLabelText('Light Mode')
      expect(button).toBeInTheDocument()
    })

    it('should call toggleColorMode when the button is clicked', async () => {
      const toggleColorMode = jest.fn()
      useColorModeContextMock.mockReturnValue({
        toggleColorMode,
        isGrayScale: false,
        colorMode: 'dark',
      })

      RenderWithWrapper(<HeaderBar onClick={jest.fn()} open={false} />)

      const button = screen.getByLabelText('Light Mode')

      await userEvent.click(button)

      expect(toggleColorMode).toHaveBeenCalledTimes(1)
    })

    it('should call toggleColorMode when the button is clicked', async () => {
      const toggleColorMode = jest.fn()

      useColorModeContextMock.mockReturnValue({
        toggleColorMode,
        isGrayScale: false,
        colorMode: 'light',
      })

      RenderWithWrapper(<HeaderBar onClick={jest.fn()} open={false} />)

      const button = screen.getByLabelText('Dark Mode')
      await userEvent.click(button)

      // Expect toggleColorMode to be called once
      expect(toggleColorMode).toHaveBeenCalledTimes(1)
    })

    it('should set alignment to "left" when colorMode is "dark"', () => {
      useColorModeContextMock.mockReturnValue({
        toggleColorMode: jest.fn(),
        isGrayScale: false,
        colorMode: 'dark',
      })

      const { getByLabelText } = RenderWithWrapper(
        <HeaderBar onClick={jest.fn()} open={false} />,
      )

      const button = getByLabelText('left aligned')

      expect(button).toHaveValue('left')

      expect(button).toHaveAttribute('aria-pressed', 'true')
    })
    it('should set alignment to "center" when colorMode is "light"', () => {
      useColorModeContextMock.mockReturnValue({
        toggleColorMode: jest.fn(),
        isGrayScale: false,
        colorMode: 'light',
      })

      const { getByLabelText } = RenderWithWrapper(
        <HeaderBar onClick={jest.fn()} open={false} />,
      )

      const button = getByLabelText('centered')

      expect(button).toHaveValue('center')

      expect(button).toHaveAttribute('aria-pressed', 'true')
    })
    it('should set alignment to "right" when colorMode is "gray-scale"', () => {
      useColorModeContextMock.mockReturnValue({
        toggleColorMode: jest.fn(),
        isGrayScale: true,
        colorMode: 'light',
      })

      const { getByLabelText } = RenderWithWrapper(
        <HeaderBar onClick={jest.fn()} open={false} />,
      )

      const button = getByLabelText('right aligned')

      expect(button).toHaveValue('right')

      expect(button).toHaveAttribute('aria-pressed', 'true')
    })
  })
  it('should call toggleColorMode with "gray-scale" when grayscale mode button is clicked', async () => {
    const toggleColorMode = jest.fn()

    useColorModeContextMock.mockReturnValue({
      toggleColorMode,
      isGrayScale: false,
      colorMode: 'light',
    })

    RenderWithWrapper(<HeaderBar onClick={jest.fn()} open={false} />)

    const grayscaleButton = screen.getByLabelText('right aligned')
    await userEvent.click(grayscaleButton)

    expect(toggleColorMode).toHaveBeenCalledWith('gray-scale')
  })
})
