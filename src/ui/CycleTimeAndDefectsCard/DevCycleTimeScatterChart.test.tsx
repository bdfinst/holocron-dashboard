import { screen } from '@testing-library/react'
import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'

import { TeamMetrics } from 'api'
import CycleTimeScatterChart, {
  ChartTooltip,
  DevCycleTimeScatterChartProps,
  getDevCycleTimeScatterChartData,
} from './DevCycleTimeScatterChart'

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
  filterTeamMetricsList: jest.fn(),
  padAndSortAscendingWeekEntires: jest.fn(),
  getMonthAndMondayDayLabel: jest.fn(),
}))

const padAndSortAscendingWeekEntriesMock =
  padAndSortAscendingWeekEntires as jest.Mock
const getMonthAndMondayDayLabelMock = getMonthAndMondayDayLabel as jest.Mock

describe('getCycleTimeScatterChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should have each data point with the average dev cycle time, and the unique dev cycle time and the number of issues for eahc unique dev cycle time', () => {
    const expected: DevCycleTimeScatterChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        // average dev cycle time for this
        // week for all the given teams was
        // ((3 devCycleTime * 4 issues) + (2 devCycleTime * 4 issues))/ 8 (issues for
        // all teams total) = 2.5
        averageDevCycleTime: 2.5,
        // dev cycle time of 3
        devCycleTime: 3,
        // 3 issues in total with dev cycle time 3
        // for all the teams for this week.
        numberOfIssues: 4,
      },
      // likewise.
      {
        xAxisTick: 'dontcare-1',
        averageDevCycleTime: 2.5,
        devCycleTime: 2,
        numberOfIssues: 4,
      },
      {
        xAxisTick: 'dontcare-2',
        averageDevCycleTime: 2.5,
        devCycleTime: 1,
        numberOfIssues: 2,
      },
      {
        xAxisTick: 'dontcare-2',
        averageDevCycleTime: 2.5,
        devCycleTime: 2,
        numberOfIssues: 2,
      },
      {
        xAxisTick: 'dontcare-2',
        averageDevCycleTime: 2.5,
        devCycleTime: 3,
        numberOfIssues: 2,
      },
      {
        xAxisTick: 'dontcare-2',
        averageDevCycleTime: 2.5,
        devCycleTime: 4,
        numberOfIssues: 2,
      },
    ].sort((a, b) => a.devCycleTime - b.devCycleTime)
    expect(
      getDevCycleTimeScatterChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                ticketDevelopmentCycleTimes: [
                  { days: 3 },
                  { days: 3 },
                  { days: 2 },
                  { days: 2 },
                ],
              },
              {
                week: 'dontcare-2',
                ticketDevelopmentCycleTimes: [
                  { days: 1 },
                  { days: 2 },
                  { days: 3 },
                  { days: 4 },
                ],
              },
            ],
          },
          {
            historicalData: [
              {
                week: 'dontcare-1',
                ticketDevelopmentCycleTimes: [
                  { days: 3 },
                  { days: 3 },
                  { days: 2 },
                  { days: 2 },
                ],
              },
              {
                week: 'dontcare-2',
                ticketDevelopmentCycleTimes: [
                  { days: 1 },
                  { days: 2 },
                  { days: 3 },
                  { days: 4 },
                ],
              },
            ],
          },
        ] as TeamMetrics[],
        weekRange: 4,
      }).sort((a, b) => a.devCycleTime - b.devCycleTime),
    ).toEqual(expected)
  })
})

describe('ChartTooltip', () => {
  RenderWithWrapper(
    <ChartTooltip
      active
      payload={[
        {
          payload: {
            xAxisTick: 'xAxisTick',
            devCycleTime: 4,
            averageDevCycleTime: 4,
            numberOfIssues: 4,
          },
        },
      ]}
    />,
  )
  expect(
    screen.getByLabelText('Average Dev Cycle Time Value'),
  ).toHaveTextContent('4 Days')
  expect(screen.getByLabelText('Dev Cycle Time Value')).toHaveTextContent(
    '4 Days',
  )
  expect(screen.getByLabelText('Number of Issues Value')).toHaveTextContent('4')
})

describe('CycleTimeScatterChart', () => {
  it('should call Scatter recharts component with mock data', () => {
    const mockData: DevCycleTimeScatterChartProps['data'] = [
      {
        xAxisTick: 'foo-bar',
        devCycleTime: 1,
        averageDevCycleTime: 1,
        numberOfIssues: 1,
      },
    ]

    RenderWithWrapper(<CycleTimeScatterChart data={mockData} />)

    expect(MockAreaChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
