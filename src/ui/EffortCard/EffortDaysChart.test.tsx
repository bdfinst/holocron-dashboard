import { screen } from '@testing-library/react'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { TeamMetrics } from 'api'
import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import EffortDaysChart, {
  ChartTooltip,
  EffortDaysChartProp,
  getEffortDaysChartData,
} from './EffortDaysChart'

const MockBarChartDataSpy = jest.fn()

jest.mock('recharts', () => ({
  BarChart: ({
    data,
    children,
  }: {
    children: React.ReactNode
    data: unknown[]
  }) => {
    MockBarChartDataSpy(data)
    return <svg>{children}</svg>
  },
  Bar: () => <div data-testid="Bar" />,
  Legend: () => <div data-testid="Legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => <div data-testid="Tooltip" />,
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

describe('getEffortDaysChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should total the days of effort type for each week', () => {
    const expected: EffortDaysChartProp['data'] = [
      {
        xAxisTick: 'dontcare-1',
        // summing up the metrics category for
        // each week for each team metrics from
        // input
        daysSpentOnDefects: 2,
        daysSpentOnFeatures: 4,
        daysSpentOnMaintenance: 6,
        daysSpentOnUnplanned: 8,
      },
      {
        xAxisTick: 'dontcare-2',
        daysSpentOnDefects: 2,
        daysSpentOnFeatures: 4,
        daysSpentOnMaintenance: 6,
        daysSpentOnUnplanned: 8,
      },
    ]
    expect(
      getEffortDaysChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                daysSpentOnDefects: 1,
                daysSpentOnFeatures: 2,
                daysSpentOnMaintenance: 3,
                daysSpentOnUnplanned: 4,
              },
              {
                week: 'dontcare-2',
                daysSpentOnDefects: 1,
                daysSpentOnFeatures: 2,
                daysSpentOnMaintenance: 3,
                daysSpentOnUnplanned: 4,
              },
            ],
          },
          {
            historicalData: [
              {
                week: 'dontcare-1',
                daysSpentOnDefects: 1,
                daysSpentOnFeatures: 2,
                daysSpentOnMaintenance: 3,
                daysSpentOnUnplanned: 4,
              },
              {
                week: 'dontcare-2',
                daysSpentOnDefects: 1,
                daysSpentOnFeatures: 2,
                daysSpentOnMaintenance: 3,
                daysSpentOnUnplanned: 4,
              },
            ],
          },
        ] as TeamMetrics[],
        weekRange: 2,
      }),
    ).toEqual(expected)
  })
})

describe('ChartTooltip', () => {
  it('should show the amount of effort (in FTE days) for each category of effort, the total, and the percentage of effort for the week for that category', () => {
    RenderWithWrapper(
      <ChartTooltip
        active
        payload={[
          {
            name: 'Features',
            value: 5,
            unit: 'FTE Days',
            color: 'rgb(1, 1, 1, 0.5)',
          },
          {
            name: 'Defects',
            value: 6,
            unit: 'FTE Days',
            color: 'rgb(1, 1, 1, 0.5)',
          },
          {
            name: 'Unplanned',
            value: 7,
            unit: 'FTE Days',
            color: 'rgb(1, 1, 1, 0.5)',
          },
          {
            name: 'Maintenance',
            value: 8,
            unit: 'FTE Days',
            color: 'rgb(1, 1, 1, 0.5)',
          },
        ]}
      />,
    )
    expect(screen.getByLabelText('Amount of Features')).toHaveTextContent(
      '5 FTE Days (19%)',
    )
    expect(screen.getByLabelText('Amount of Defects')).toHaveTextContent(
      '6 FTE Days (23%)',
    )
    expect(screen.getByLabelText('Amount of Unplanned')).toHaveTextContent(
      '7 FTE Days (27%)',
    )
    expect(screen.getByLabelText('Amount of Maintenance')).toHaveTextContent(
      '8 FTE Days (31%)',
    )

    expect(screen.getByLabelText('Total Amount')).toHaveTextContent(
      '26 FTE Days',
    )
  })
})

describe('EffortDaysChart', () => {
  it('should have the bar chart accept the computed data', () => {
    const mockData: EffortDaysChartProp['data'] = [
      {
        xAxisTick: 'foo-bar',
        daysSpentOnFeatures: 1,
        daysSpentOnDefects: 1,
        daysSpentOnUnplanned: 1,
        daysSpentOnMaintenance: 1,
      },
    ]

    RenderWithWrapper(<EffortDaysChart data={mockData} />)

    expect(MockBarChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
