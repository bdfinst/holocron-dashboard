import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { TeamMetrics } from 'api'
import DevCycleTimeTrendChart, {
  DevCycleTimeTrendChartProps,
  getDevCycleTimeTrendChartData,
} from './DevCycleTimeTrendChart'

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

describe('getDevCycleTimeTrendChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should compute the average dev cycle time for the given list of team metrics with given parameters', () => {
    const expected: DevCycleTimeTrendChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        // average of for example in this week:
        // [{ days: 4 }, { days: 5 }] and [{ days: 2 }]
        // for all the team's ticketDevelopmentCycleTimes
        // rounded to 2 decimal places.
        averageDevCycleTime: 3.67,
      },
      // likewise.
      {
        xAxisTick: 'dontcare-2',
        averageDevCycleTime: 2,
      },
      {
        xAxisTick: 'dontcare-3',
        averageDevCycleTime: 1,
      },
      {
        xAxisTick: 'dontcare-4',
        averageDevCycleTime: 2,
      },
    ]
    expect(
      getDevCycleTimeTrendChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                ticketDevelopmentCycleTimes: [{ days: 4 }, { days: 5 }],
              },
              {
                week: 'dontcare-2',
                ticketDevelopmentCycleTimes: [{ days: 1 }, { days: 2 }],
              },
              {
                week: 'dontcare-3',
                ticketDevelopmentCycleTimes: [{ days: 1 }],
              },
              {
                week: 'dontcare-4',
                ticketDevelopmentCycleTimes: [{ days: 2 }],
              },
            ],
          },
          {
            historicalData: [
              {
                week: 'dontcare-1',
                ticketDevelopmentCycleTimes: [{ days: 2 }],
              },
              {
                week: 'dontcare-2',
                ticketDevelopmentCycleTimes: [{ days: 3 }],
              },
              {
                week: 'dontcare-3',
                ticketDevelopmentCycleTimes: [{ days: 1 }],
              },
              {
                week: 'dontcare-4',
                ticketDevelopmentCycleTimes: [{ days: 2 }],
              },
            ],
          },
        ] as TeamMetrics[],
        weekRange: 2,
      }),
    ).toEqual(expected)
  })
})

describe('DevCycleTimeTrendChart', () => {
  it('should call the area chart to accept the computed data', () => {
    const mockData: DevCycleTimeTrendChartProps['data'] = [
      {
        xAxisTick: 'foo-bar',
        averageDevCycleTime: 1,
      },
    ]
    RenderWithWrapper(<DevCycleTimeTrendChart data={mockData} />)

    expect(MockAreaChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
