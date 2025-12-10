import { render, screen, within } from '@testing-library/react'
import MockMetrics from '__mocks__/Metrics'
import LeadTimeCard from '.'

jest.mock('./helpContent.md', () => 'helpContent')

jest.mock('./ThroughputTrendChart', () => ({
  ...jest.requireActual('./ThroughputTrendChart'),
  __esModule: true,
  default: () => <div data-testid="ThroughputTrendChart" />,
}))

jest.mock('./LeadTimeScatterChart', () => ({
  ...jest.requireActual('./LeadTimeScatterChart'),
  __esModule: true,
  default: () => <div data-testid="LeadTimeScatterChart" />,
}))

jest.mock('./LeadTimeTrendChart', () => ({
  ...jest.requireActual('./LeadTimeTrendChart'),
  __esModule: true,
  default: () => <div data-testid="LeadTimeTrendChart" />,
}))

jest.mock('utils/DashboardWidgetWrapper', () => ({
  ...jest.requireActual('utils/DashboardWidgetWrapper'),
  __esModule: true,
  default: ({ children, AdditionalInformation }) => (
    <div>
      <>{children}</>
      <div data-testid="AdditionalInformation">{AdditionalInformation}</div>
    </div>
  ),
}))

describe('LeadTimeCard', () => {
  it('should render with the lead time and throughput trend charts, and the same charts and scatter chart within additional information', () => {
    render(<LeadTimeCard apiMetrics={MockMetrics.result} weekRange={4} />)

    expect(screen.getByTestId('LeadTimeTrendChart')).toBeInTheDocument()
    expect(screen.getAllByTestId('ThroughputTrendChart')).toHaveLength(2)
    const { getByTestId } = within(
      // first card wrapper additional information is what we are
      // interested in in the ui.
      screen.getAllByTestId('AdditionalInformation')[0],
    )
    expect(getByTestId('LeadTimeScatterChart')).toBeInTheDocument()
    expect(getByTestId('ThroughputTrendChart')).toBeInTheDocument()
  })
})
