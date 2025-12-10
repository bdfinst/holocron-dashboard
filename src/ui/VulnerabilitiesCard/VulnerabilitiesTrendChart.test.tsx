import { TeamMetrics } from 'api'
import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import VulnerabilitiesTrendChart, {
  VulnerabilitiesTrendChartProps,
  getVulnerabilitiesTrendChartData,
} from './VulnerabilitiesTrendChart'

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

describe('getVulnerabilitiesTrendChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should show the total vulnerabilities for each week for a team (team only graph)', () => {
    const expected: VulnerabilitiesTrendChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        vulnerabilities: 4,
      },
      {
        xAxisTick: 'dontcare-2',
        vulnerabilities: 10,
      },
    ]
    expect(
      getVulnerabilitiesTrendChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                vulnerabilities: 4,
              },
              {
                week: 'dontcare-2',
                vulnerabilities: 10,
              },
            ],
          },
        ] as TeamMetrics[],
        weekRange: 2,
      }),
    ).toEqual(expected)
  })
})

describe('VulnerabilitiesTrendChart', () => {
  it('should call the AreaChart from recharts library with computed data', () => {
    const mockData: VulnerabilitiesTrendChartProps['data'] = [
      {
        xAxisTick: 'dontcare',
        vulnerabilities: 2,
      },
    ]

    RenderWithWrapper(<VulnerabilitiesTrendChart data={mockData} />)

    expect(MockAreaChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
