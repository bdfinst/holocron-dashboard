import { screen, within } from '@testing-library/react'
import { useAPIContext } from 'api'
import MockOrganizationMetrics from '__mocks__/Metrics'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import EffortCard from '.'

jest.mock('./helpContent.md', () => 'helpContent')

jest.mock('./EffortDaysChart', () => ({
  __esModule: true,
  default: () => <div data-testid="EffortDaysChart" />,
  getEffortDaysChartData: jest.fn().mockReturnValue([]),
}))

jest.mock('./EffortCostsChart', () => ({
  __esModule: true,
  default: () => <div data-testid="EffortCostsChart" />,
  getEffortCostsChartData: jest.fn().mockReturnValue([]),
}))

jest.mock('./EffortCostsAggregateTable', () => ({
  __esModule: true,
  default: () => <div data-testid="EffortCostsAggregateTable" />,
}))

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
}))

jest.mock('utils/DashboardWidgetWrapper', () => ({
  ...jest.requireActual('utils/DashboardWidgetWrapper'),
  __esModule: true,
  default: ({
    children,
    AdditionalInformation,
  }: {
    children: React.ReactNode
    AdditionalInformation: React.ReactNode
  }) => (
    <div>
      <>{children}</>
      <div data-testid="AdditionalInformation">{AdditionalInformation}</div>
    </div>
  ),
}))

const useTeamContextMock = useAPIContext as jest.Mock

describe('EffortCard', () => {
  beforeEach(() => {
    useTeamContextMock.mockReturnValue({
      featureFlags: {
        FEATURE_COST_METRICS: false,
      },
    })
  })

  it('should render with EffortDaysChart', () => {
    RenderWithWrapper(
      <EffortCard apiMetrics={MockOrganizationMetrics.result} weekRange={4} />,
    )

    expect(screen.getByTestId('EffortDaysChart')).toBeInTheDocument()
  })

  it('if FEATURE_COST_METRICS is true and the chart must show details, it should show the cost charts as well', () => {
    useTeamContextMock.mockReturnValue({
      featureFlags: {
        FEATURE_COST_METRICS: true,
      },
    })
    RenderWithWrapper(
      <EffortCard
        apiMetrics={MockOrganizationMetrics.result}
        weekRange={4}
        showDetails
      />,
    )

    const { getByTestId } = within(
      // first card wrapper additional information is what we are
      // interested in in the ui.
      screen.getAllByTestId('AdditionalInformation')[0],
    )

    expect(getByTestId('EffortCostsAggregateTable')).toBeInTheDocument()
    expect(getByTestId('EffortCostsChart')).toBeInTheDocument()
  })
})
