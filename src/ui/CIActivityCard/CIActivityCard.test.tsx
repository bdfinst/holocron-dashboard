import { useAPIContext, FeatureFlags } from 'api'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { screen } from '@testing-library/react'
import CIActivityCard, { ChartTooltip } from '.'
import { getCIActivityChartData, CIActivityChartDataPoint } from './utils'

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
}))

jest.mock('./IntegrationRates', () => ({
  __esModule: true,
  default: () => <div data-testid="IntegrationRates" />,
}))

const MockBarChartDataSpy = jest.fn()

jest.mock('recharts', () => {
  const mockComponent = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
  return {
    ...jest.requireActual('recharts'),
    Bar: mockComponent,
    BarChart: ({
      children,
      data,
    }: {
      children: React.ReactNode
      data: unknown
    }) => {
      MockBarChartDataSpy(data)
      return <div>{children}</div>
    },
    Cell: mockComponent,
    Label: mockComponent,
    ReferenceLine: mockComponent,
    Tooltip: mockComponent,
    XAxis: mockComponent,
    YAxis: mockComponent,
    ResponsiveContainer: mockComponent,
  }
})

jest.mock('./helpContent.md', () => 'help content')

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  getCIActivityChartData: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock
const getCIActivityChartDataMock = getCIActivityChartData as jest.Mock

const featureFlags: FeatureFlags = { FEATURE_EXTERNAL_CONTRIBUTORS: true }

describe('ChartTooltip', () => {
  beforeAll(() => {
    useAPIContextMock.mockReturnValue({
      featureFlags,
    })
  })

  it('should render with the payload information', () => {
    RenderWithWrapper(
      <ChartTooltip
        active
        payload={[
          {
            name: 'CI Progress',
            value: 20,
            payload: {
              week: '',
              xAxisTick: '',
              totalDirectIntegrations: 0,
              totalExternalIntegrations: 2,
              minimumIntegrationsNeeded: 5,
              totalInternalIntegrations: 1,
              percentProgressToCI: 20,
              averageTeamSize: 1,
            },
          },
        ]}
        label="title"
      />,
    )
    expect(screen.getByLabelText('Progress To CI')).toHaveTextContent('20%')
    expect(screen.getByLabelText('Team Size')).toHaveTextContent('1')
    expect(
      screen.getByLabelText('Internal Integrations / Goal'),
    ).toHaveTextContent('1 / 5')
    expect(
      screen.getByLabelText('Direct Integrations / Percent'),
    ).toHaveTextContent('0 / 0')
    expect(
      screen.getByLabelText('External Integrations / Percent'),
    ).toHaveTextContent('2 / 66.7')
  })
})

describe('CIActivityCard', () => {
  it('should render BarChart accepting the ci activity data', () => {
    const data: CIActivityChartDataPoint[] = [
      {
        week: '',
        xAxisTick: '',
        totalDirectIntegrations: 1,
        totalExternalIntegrations: 1,
        minimumIntegrationsNeeded: 1,
        totalInternalIntegrations: 1,
        percentProgressToCI: 1,
        averageTeamSize: 1,
      },
    ]
    getCIActivityChartDataMock.mockReturnValueOnce(data)

    RenderWithWrapper(<CIActivityCard apiMetrics={[]} weekRange={4} />)

    expect(MockBarChartDataSpy).toHaveBeenCalledWith(data)
  })
})
