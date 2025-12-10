import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { TeamMetrics } from 'api'
import LeadTimeTrendChart, {
  getLeadTimeTrendChartData,
  LeadTimeTrendChartProps,
} from './LeadTimeTrendChart'

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

describe('getLeadTimeTrendChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should get the aggregate average lead time for a group of teamMetrics week data within the same week', () => {
    const expected: LeadTimeTrendChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        // will be average of [4, 5, 4, 5] = roundValue(18 / 4, 1) = 4.5
        // due to averaging each week entry for each team
        averageStoryLeadTime: 4.5,
      },
      // likewise.
      {
        xAxisTick: 'dontcare-2',
        averageStoryLeadTime: 6.5,
      },
      {
        xAxisTick: 'dontcare-3',
        averageStoryLeadTime: 9,
      },
      {
        xAxisTick: 'dontcare-4',
        averageStoryLeadTime: 11.5,
      },
    ]
    expect(
      getLeadTimeTrendChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                ticketLeadTimes: [{ days: 4 }, { days: 5 }],
              },
              {
                week: 'dontcare-2',
                ticketLeadTimes: [{ days: 6 }, { days: 7 }],
              },
              {
                week: 'dontcare-3',
                ticketLeadTimes: [{ days: 8 }, { days: 10 }],
              },
              {
                week: 'dontcare-4',
                ticketLeadTimes: [{ days: 10 }, { days: 13 }],
              },
            ],
          },
          {
            historicalData: [
              {
                week: 'dontcare-1',
                ticketLeadTimes: [{ days: 4 }, { days: 5 }],
              },
              {
                week: 'dontcare-2',
                ticketLeadTimes: [{ days: 6 }, { days: 7 }],
              },
              {
                week: 'dontcare-3',
                ticketLeadTimes: [{ days: 8 }, { days: 10 }],
              },
              {
                week: 'dontcare-4',
                ticketLeadTimes: [{ days: 10 }, { days: 13 }],
              },
            ],
          },
        ] as TeamMetrics[],
        weekRange: 4,
      }),
    ).toEqual(expected)
  })
})

describe('LeadTimeTrendChart', () => {
  it('should call the AreaChart from recharts library with computed data', () => {
    const mockData: LeadTimeTrendChartProps['data'] = [
      {
        xAxisTick: 'dontcare',
        averageStoryLeadTime: 1,
      },
    ]

    RenderWithWrapper(<LeadTimeTrendChart data={mockData} />)

    expect(MockAreaChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
