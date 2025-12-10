import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { TeamMetrics } from 'api'
import ThroughputTrendChart, {
  getThroughputTrendChartData,
  ThroughputTrendChartProps,
} from './ThroughputTrendChart'

const MockAreaChartDataSpy = jest.fn()

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AreaChart: ({
    data,
    children,
  }: {
    data: unknown
    children: React.ReactNode
  }) => {
    MockAreaChartDataSpy(data)
    return <svg>{children}</svg>
  },
  Area: () => <div data-testid="Area" />,
  XAxis: () => <div data-testid="XAxis" />,
  YAxis: () => <div data-testid="YAxis" />,
  Tooltip: () => <div data-testid="Tooltip" />,
  Legend: () => <div data-testid="Legend" />,
}))

jest.mock('utils/DashboardWidgetWrapper', () => ({
  ...jest.requireActual('utils/DashboardWidgetWrapper'),
  padAndSortAscendingWeekEntires: jest.fn(),
  getMonthAndMondayDayLabel: jest.fn(),
}))

const padAndSortAscendingWeekEntriesMock =
  padAndSortAscendingWeekEntires as jest.Mock
const getMonthAndMondayDayLabelMock = getMonthAndMondayDayLabel as jest.Mock

describe('getThroughputTrendChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should aggregate the total throughput for each week given a team metrics list', () => {
    const expected: ThroughputTrendChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        // throughput of 9 repeated 2 times for each
        // team historical data for this week.
        totalThroughput: 18,
      },
      // likewise.
      {
        xAxisTick: 'dontcare-2',
        totalThroughput: 20,
      },
      {
        xAxisTick: 'dontcare-3',
        totalThroughput: 22,
      },
      {
        xAxisTick: 'dontcare-4',
        totalThroughput: 24,
      },
    ]
    expect(
      getThroughputTrendChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                totalThroughput: 9,
              },
              {
                week: 'dontcare-2',
                totalThroughput: 10,
              },
              {
                week: 'dontcare-3',
                totalThroughput: 11,
              },
              {
                week: 'dontcare-4',
                totalThroughput: 12,
              },
            ],
          },
          {
            historicalData: [
              {
                week: 'dontcare-1',
                totalThroughput: 9,
              },
              {
                week: 'dontcare-2',
                totalThroughput: 10,
              },
              {
                week: 'dontcare-3',
                totalThroughput: 11,
              },
              {
                week: 'dontcare-4',
                totalThroughput: 12,
              },
            ],
          },
        ] as TeamMetrics[],
        weekRange: 4,
      }),
    ).toEqual(expected)
  })
})

describe('ThroughputTrendChart', () => {
  it('should call the AreaChart from recharts library with computed data', () => {
    const mockData: ThroughputTrendChartProps['data'] = [
      {
        xAxisTick: 'dontcare',
        totalThroughput: 1,
      },
    ]

    RenderWithWrapper(<ThroughputTrendChart data={mockData} />)

    expect(MockAreaChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
