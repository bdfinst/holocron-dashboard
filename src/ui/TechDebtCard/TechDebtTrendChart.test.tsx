import { TeamMetrics } from 'api'
import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import TechDebtTrendChart, {
  TechDebtTrendChartProps,
  getTechDebtTrendChartData,
} from './TechDebtTrendChart'

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

describe('getTechDebtTrendChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should total the maintainability issues(tech debt) for each week', () => {
    const expected: TechDebtTrendChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        totalTechDebt: 4,
      },
      {
        xAxisTick: 'dontcare-2',
        totalTechDebt: 10,
      },
    ]
    expect(
      getTechDebtTrendChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                maintainabilityIssues: 2,
              },
              {
                week: 'dontcare-2',
                maintainabilityIssues: 5,
              },
            ],
          },
          {
            historicalData: [
              {
                week: 'dontcare-1',
                maintainabilityIssues: 2,
              },
              {
                week: 'dontcare-2',
                maintainabilityIssues: 5,
              },
            ],
          },
        ] as TeamMetrics[],
        weekRange: 2,
      }),
    ).toEqual(expected)
  })
})

describe('TechDebtTrendChart', () => {
  it('should call the AreaChart from recharts library with computed data', () => {
    const mockData: TechDebtTrendChartProps['data'] = [
      {
        xAxisTick: 'dontcare',
        totalTechDebt: 2,
      },
    ]

    RenderWithWrapper(<TechDebtTrendChart data={mockData} />)

    expect(MockAreaChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
