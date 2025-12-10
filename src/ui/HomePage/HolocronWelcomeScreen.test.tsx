import { render, screen } from '@testing-library/react'
import HolocronWelcomeScreen from './HolocronWelcomeScreen'

describe('HolocronWelcomeScreen', () => {
  it('should show a welcome to holocron message', () => {
    render(<HolocronWelcomeScreen />)

    expect(
      screen.getByRole('heading', { name: 'Welcome to Holocron!' }),
    ).toBeInTheDocument()
  })
})
