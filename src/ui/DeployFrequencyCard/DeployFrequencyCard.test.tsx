import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { screen, within } from '@testing-library/react'
import { TeamMetrics } from 'api'
import { getDefectRateTrendChartData } from 'ui/CycleTimeAndDefectsCard'
import DeployFrequencyCard, {
  DeployFrequencyChartProps,
  getDeployFrequencyChartData,
} from '.'

const MockBarChartDataSpy = jest.fn()

jest.mock('./helpContent.md', () => 'helpContent')

jest.mock('ui/CycleTimeAndDefectsCard', () => ({
  DefectRateTrendChart: () => <div data-testid="DefectRateTrendChart" />,
  getDefectRateTrendChartData: jest.fn(),
}))

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({
    data,
    children,
  }: {
    data: unknown
    children: React.ReactNode
  }) => {
    MockBarChartDataSpy(data)
    return <svg>{children}</svg>
  },
  XAxis: () => <div data-testid="XAxis" />,
  YAxis: () => <div data-testid="YAxis" />,
  Tooltip: () => <div data-testid="Tooltip" />,
  Legend: () => <div data-testid="Legend" />,
  Bar: () => <div data-testid="Bar" />,
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
  padAndSortAscendingWeekEntires: jest.fn(),
  getMonthAndMondayDayLabel: jest.fn(),
}))

const padAndSortAscendingWeekEntriesMock =
  padAndSortAscendingWeekEntires as jest.Mock
const getMonthAndMondayDayLabelMock = getMonthAndMondayDayLabel as jest.Mock
const getDevCycleTimeTrendChartDataMock =
  getDefectRateTrendChartData as jest.Mock

const mockApiMetrics = [
  {
    historicalData: [
      {
        week: 'dontcare-1',
        totalDeploys: 6,
      },
      {
        week: 'dontcare-2',
        totalDeploys: 6,
      },
      {
        week: 'dontcare-3',
        totalDeploys: 6,
      },
      {
        week: 'dontcare-4',
        totalDeploys: 6,
      },
    ],
  },
  {
    historicalData: [
      {
        week: 'dontcare-1',
        totalDeploys: 6,
      },
      {
        week: 'dontcare-2',
        totalDeploys: 6,
      },
      {
        week: 'dontcare-3',
        totalDeploys: 6,
      },
      {
        week: 'dontcare-4',
        totalDeploys: 6,
      },
    ],
  },
] as TeamMetrics[]

describe('getDeployFrequencyChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should get the total amount of deploys', () => {
    const expected: DeployFrequencyChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        // should sum up totalDeploys for all
        // the team metrics
        deploys: 12,
      },
      {
        xAxisTick: 'dontcare-2',
        deploys: 12,
      },
      {
        xAxisTick: 'dontcare-3',
        deploys: 12,
      },
      {
        xAxisTick: 'dontcare-4',
        deploys: 12,
      },
    ]
    expect(
      getDeployFrequencyChartData({
        apiMetrics: mockApiMetrics,
        weekRange: 4,
      }),
    ).toEqual(expected)
  })
})

describe('DeployFrequencyCard', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
    getDevCycleTimeTrendChartDataMock.mockReturnValue([
      { xAxisTick: 'dontcare-1', defectsCreated: 1 },
    ])
  })

  it('should call BarChart with mock data', () => {
    const expected: DeployFrequencyChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        deploys: 12,
      },
      {
        xAxisTick: 'dontcare-2',
        deploys: 12,
      },
      {
        xAxisTick: 'dontcare-3',
        deploys: 12,
      },
      {
        xAxisTick: 'dontcare-4',
        deploys: 12,
      },
    ]
    RenderWithWrapper(
      <DeployFrequencyCard apiMetrics={mockApiMetrics} weekRange={4} />,
    )

    expect(MockBarChartDataSpy).toHaveBeenCalledWith(expected)
  })

  it('should show defect rate trend chart in additional information', () => {
    RenderWithWrapper(
      <DeployFrequencyCard apiMetrics={mockApiMetrics} weekRange={4} />,
    )
    const { getByTestId } = within(
      // first card wrapper additional information is what we are
      // interested in in the ui.
      screen.getAllByTestId('AdditionalInformation')[0],
    )
    expect(getByTestId('DefectRateTrendChart')).toBeInTheDocument()
  })
})
