import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { TeamMetrics } from 'api'
import DefectRateTrendChart, {
  DefectRateTrendChartProps,
  getDefectRateTrendChartData,
} from './DefectRateTrendChart'

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

describe('getDefectRateTrendChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should have the total number of defects created for each week of the team metrics list', () => {
    const expected: DefectRateTrendChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        // totals to 6 for this week label
        // for all team metrics.
        defectsCreated: 6,
      },
      {
        xAxisTick: 'dontcare-2',
        defectsCreated: 6,
      },
      {
        xAxisTick: 'dontcare-3',
        defectsCreated: 6,
      },
      {
        xAxisTick: 'dontcare-4',
        defectsCreated: 6,
      },
    ]
    expect(
      getDefectRateTrendChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                defectsCreated: 3,
              },
              {
                week: 'dontcare-2',
                defectsCreated: 3,
              },
              {
                week: 'dontcare-3',
                defectsCreated: 3,
              },
              {
                week: 'dontcare-4',
                defectsCreated: 3,
              },
            ],
          },
          {
            historicalData: [
              {
                week: 'dontcare-1',
                defectsCreated: 3,
              },
              {
                week: 'dontcare-2',
                defectsCreated: 3,
              },
              {
                week: 'dontcare-3',
                defectsCreated: 3,
              },
              {
                week: 'dontcare-4',
                defectsCreated: 3,
              },
            ],
          },
        ] as TeamMetrics[],
        weekRange: 2,
      }),
    ).toEqual(expected)
  })
})

describe('DefectRateTrendChart', () => {
  it('should have the area chart to accept the computed data', () => {
    const mockData: DefectRateTrendChartProps['data'] = [
      {
        xAxisTick: 'foo-bar',
        defectsCreated: 1,
      },
    ]
    RenderWithWrapper(<DefectRateTrendChart data={mockData} />)

    expect(MockAreaChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
