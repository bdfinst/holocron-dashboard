import { screen } from '@testing-library/react'
import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { TeamMetrics } from 'api'
import LeadTimeScatterChart, {
  LeadTimeScatterChartProps,
  getLeadTimeScatterChartData,
  ChartTooltip,
} from './LeadTimeScatterChart'

const MockAreaChartDataSpy = jest.fn()

jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ScatterChart: ({ children }: { children: React.ReactNode }) => (
    <svg>{children}</svg>
  ),
  Tooltip: () => <div data-testid="Tooltip" />,
  XAxis: () => <div data-testid="XAxis" />,
  YAxis: () => <div data-testid="YAxis" />,
  ZAxis: () => <div data-testid="ZAxis" />,
  Legend: () => <div data-testid="Legend" />,
  Scatter: ({ data }: { data: unknown }) => {
    MockAreaChartDataSpy(data)
    return <div data-testid="Scatter" />
  },
}))

jest.mock('utils/DashboardWidgetWrapper', () => ({
  ...jest.requireActual('utils/DashboardWidgetWrapper'),
  padAndSortAscendingWeekEntires: jest.fn(),
  getMonthAndMondayDayLabel: jest.fn(),
}))

const padAndSortAscendingWeekEntriesMock =
  padAndSortAscendingWeekEntires as jest.Mock
const getMonthAndMondayDayLabelMock = getMonthAndMondayDayLabel as jest.Mock

describe('getLeadTimeScatterChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should have each data point with the average lead time, the unique lead time and the number of issues for each unique lead time', () => {
    const expected: LeadTimeScatterChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        // average of [5, 5, 1, 1] repeated 2 times
        // due to the number of teams for this week.
        averageStoryLeadTime: 3,
        // lead time of 5.
        leadTime: 5,
        // count should be 4 because lead time
        // of 5 is repeated 2 times
        // for each week of every team
        numberOfIssues: 4,
      },
      // likewise.
      {
        xAxisTick: 'dontcare-1',
        averageStoryLeadTime: 3,
        leadTime: 1,
        numberOfIssues: 4,
      },
      {
        xAxisTick: 'dontcare-2',
        averageStoryLeadTime: 4.5,
        leadTime: 3,
        numberOfIssues: 2,
      },
      {
        xAxisTick: 'dontcare-2',
        averageStoryLeadTime: 4.5,
        leadTime: 4,
        numberOfIssues: 2,
      },
      {
        xAxisTick: 'dontcare-2',
        averageStoryLeadTime: 4.5,
        leadTime: 5,
        numberOfIssues: 2,
      },
      {
        xAxisTick: 'dontcare-2',
        averageStoryLeadTime: 4.5,
        leadTime: 6,
        numberOfIssues: 2,
      },
    ].sort((a, b) => a.leadTime - b.leadTime)
    expect(
      getLeadTimeScatterChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                ticketLeadTimes: [
                  { days: 5 },
                  { days: 5 },
                  { days: 1 },
                  { days: 1 },
                ],
              },
              {
                week: 'dontcare-2',
                ticketLeadTimes: [
                  { days: 3 },
                  { days: 4 },
                  { days: 5 },
                  { days: 6 },
                ],
              },
            ],
          },
          {
            historicalData: [
              {
                week: 'dontcare-1',
                ticketLeadTimes: [
                  { days: 5 },
                  { days: 5 },
                  { days: 1 },
                  { days: 1 },
                ],
              },
              {
                week: 'dontcare-2',
                ticketLeadTimes: [
                  { days: 3 },
                  { days: 4 },
                  { days: 5 },
                  { days: 6 },
                ],
              },
            ],
          },
        ] as TeamMetrics[],
        weekRange: 4,
      }).sort((a, b) => a.leadTime - b.leadTime),
    ).toEqual(expected)
  })
})

describe('ChartTooltip', () => {
  it('should show the lead time, average story lead time for the week, and the number of issues with the said lead time', () => {
    RenderWithWrapper(
      <ChartTooltip
        active
        payload={[
          {
            payload: {
              xAxisTick: 'xAxisTick',
              leadTime: 4,
              averageStoryLeadTime: 4,
              numberOfIssues: 4,
            },
          },
        ]}
      />,
    )
    expect(screen.getByLabelText('Average Lead Time Value')).toHaveTextContent(
      '4 Days',
    )
    expect(screen.getByLabelText('Lead Time Value')).toHaveTextContent('4 Days')
    expect(screen.getByLabelText('Number of Issues Value')).toHaveTextContent(
      '4',
    )
  })
})

describe('LeadTimeScatterChart', () => {
  it('should call Scatter recharts component with mock data', () => {
    const mockData: LeadTimeScatterChartProps['data'] = [
      {
        xAxisTick: 'dontcare',
        leadTime: 1,
        averageStoryLeadTime: 1,
        numberOfIssues: 1,
      },
    ]

    RenderWithWrapper(<LeadTimeScatterChart data={mockData} />)

    expect(MockAreaChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
