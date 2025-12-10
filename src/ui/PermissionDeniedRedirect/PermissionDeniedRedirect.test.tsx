import { render, screen } from '@testing-library/react'
import PermissionDeniedRedirect from '.'

describe('PermissionDeniedRedirect', () => {
  it('should render with permission denied message', () => {
    render(<PermissionDeniedRedirect />)
    expect(
      screen.getByLabelText('Permission Denied Warning Title'),
    ).toHaveTextContent('Warning: Not enough privileges')
    expect(
      screen.getByText('You do not have enough privileges to view this page.'),
    ).toBeInTheDocument()
  })
})
