import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { TeamMetrics } from 'api'
import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import EffortCostsChart, {
  EffortCostsChartProps,
  getEffortCostsChartData,
} from './EffortCostsChart'

const MockAreaChartDataSpy = jest.fn()

jest.mock('recharts', () => ({
  Area: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  AreaChart: ({
    data,
    children,
  }: {
    data: unknown
    children: React.ReactNode
  }) => {
    MockAreaChartDataSpy(data)
    return <div>{children}</div>
  },
  Legend: () => <div data-testid="Legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => <div data-testid="Legend" />,
  XAxis: () => <div data-testid="XAxis" />,
  YAxis: () => <div data-testid="YAxis" />,
}))

jest.mock('utils/DashboardWidgetWrapper', () => ({
  ...jest.requireActual('utils/DashboardWidgetWrapper'),
  padAndSortAscendingWeekEntires: jest.fn(),
  getMonthAndMondayDayLabel: jest.fn(),
}))

const padAndSortAscendingWeekEntriesMock =
  padAndSortAscendingWeekEntires as jest.Mock
const getMonthAndMondayDayLabelMock = getMonthAndMondayDayLabel as jest.Mock

describe('getEffortCostsChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should total the costs of effort type for each week', () => {
    const expected: EffortCostsChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        // summing up the metrics category for
        // each week for each team metrics from
        // input
        amountSpentOnDefects: 2,
        amountSpentOnFeatures: 4,
        amountSpentOnMaintenance: 6,
        amountSpentOnUnplanned: 8,
      },
      {
        xAxisTick: 'dontcare-2',
        amountSpentOnDefects: 2,
        amountSpentOnFeatures: 4,
        amountSpentOnMaintenance: 6,
        amountSpentOnUnplanned: 8,
      },
    ]
    expect(
      getEffortCostsChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                amountSpentOnDefects: 1,
                amountSpentOnFeatures: 2,
                amountSpentOnMaintenance: 3,
                amountSpentOnUnplanned: 4,
              },
              {
                week: 'dontcare-2',
                amountSpentOnDefects: 1,
                amountSpentOnFeatures: 2,
                amountSpentOnMaintenance: 3,
                amountSpentOnUnplanned: 4,
              },
            ],
          },
          {
            historicalData: [
              {
                week: 'dontcare-1',
                amountSpentOnDefects: 1,
                amountSpentOnFeatures: 2,
                amountSpentOnMaintenance: 3,
                amountSpentOnUnplanned: 4,
              },
              {
                week: 'dontcare-2',
                amountSpentOnDefects: 1,
                amountSpentOnFeatures: 2,
                amountSpentOnMaintenance: 3,
                amountSpentOnUnplanned: 4,
              },
            ],
          },
        ] as TeamMetrics[],
        weekRange: 2,
      }),
    ).toEqual(expected)
  })
})

describe('EffortCostsChart', () => {
  it('should call AreaChart with the computed data', () => {
    const mockData: EffortCostsChartProps['data'] = [
      {
        xAxisTick: 'foo-bar',
        amountSpentOnFeatures: 1,
        amountSpentOnDefects: 1,
        amountSpentOnMaintenance: 1,
        amountSpentOnUnplanned: 1,
      },
    ]
    RenderWithWrapper(<EffortCostsChart data={mockData} />)
    expect(MockAreaChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
