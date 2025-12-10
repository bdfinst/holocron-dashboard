import { screen } from '@testing-library/react'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import IntegrationRatesCard from './IntegrationRates'

jest.mock('utils/TrendIndicator', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => (
    <div data-testid={`${title} Trend`} />
  ),
}))

// Mock recharts
jest.mock('recharts', () => {
  const mockComponent = ({ children }) => <div>{children}</div>
  return {
    Legend: mockComponent,
    Line: ({ dataKey }: { dataKey: string }) => <div>{dataKey}</div>,
    LineChart: mockComponent,
    ResponsiveContainer: mockComponent,
    Tooltip: mockComponent,
    XAxis: mockComponent,
    YAxis: mockComponent,
  }
})

describe('IntegrationRatesCard', () => {
  it('should render with the card title and show the trends', () => {
    RenderWithWrapper(
      <IntegrationRatesCard
        data={[
          {
            week: '2021_19',
            xAxisTick: 'May 10',
            totalDirectIntegrations: 1,
            totalExternalIntegrations: 1,
            minimumIntegrationsNeeded: 1,
            totalInternalIntegrations: 1,
            percentProgressToCI: 1,
            averageTeamSize: 1,
          },
          {
            week: '2021_19',
            xAxisTick: 'May 17',
            totalDirectIntegrations: 1,
            totalExternalIntegrations: 1,
            minimumIntegrationsNeeded: 1,
            totalInternalIntegrations: 1,
            percentProgressToCI: 1,
            averageTeamSize: 1,
          },
        ]}
      />,
    )

    expect(screen.getByText('Integration Rates')).toBeInTheDocument()
    expect(screen.getByTestId('Direct Integrations Trend')).toBeInTheDocument()
    expect(
      screen.getByTestId('Internal Integrations Trend'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('External Integrations Trend'),
    ).toBeInTheDocument()
  })
})
