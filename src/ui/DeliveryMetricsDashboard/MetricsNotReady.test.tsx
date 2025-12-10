import { render, screen } from '@testing-library/react'
import MetricsNotReady from './MetricsNotReady'

describe('MetricsNotReady', () => {
  it('should render with the given message', () => {
    render(<MetricsNotReady message="Not ready" />)

    expect(screen.getByLabelText('data-not-ready-message')).toHaveTextContent(
      'Not ready',
    )
  })
})
