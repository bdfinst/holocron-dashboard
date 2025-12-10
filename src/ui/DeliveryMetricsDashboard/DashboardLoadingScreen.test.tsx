import { render, screen } from '@testing-library/react'
import DashboardLoadingScreen from './DashboardLoadingScreen'

describe('DashboardLoadingScreen', () => {
  it('should render with progress bars', () => {
    render(<DashboardLoadingScreen />)

    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0)
  })
})
