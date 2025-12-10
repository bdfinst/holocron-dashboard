import { render, screen } from '@testing-library/react'
import NotFoundRedirect from '.'

describe('PermissionDeniedRedirect', () => {
  it('should render with permission denied message', () => {
    render(<NotFoundRedirect />)
    expect(screen.getByLabelText('Page not found warning')).toHaveTextContent(
      'Warning: Page not Found',
    )
    expect(
      screen.getByText(
        'The page you requested does not exist. Click the logo to go back to the main page.',
      ),
    ).toBeInTheDocument()
  })
})
