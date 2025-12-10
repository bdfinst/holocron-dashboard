import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { TeamMetrics } from 'api'
import { screen } from '@testing-library/react'
import TechDebtTrendBySeverityChart, {
  TechDebtTrendBySeverityChartProps,
  getTechDebtTrendBySeverityChartData,
  ChartTooltip,
} from './TechDebtTrendBySeverityChart'

const MockLineChartDataSpy = jest.fn()

jest.mock('recharts', () => ({
  Legend: () => <div data-tesid="Legend" />,
  Line: ({ dataKey }: { dataKey: string }) => <div>{dataKey}</div>,
  LineChart: ({
    children,
    data,
  }: {
    data: unknown
    children: React.ReactNode
  }) => {
    MockLineChartDataSpy(data)
    return <svg>{children}</svg>
  },
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

beforeAll(() => {
  padAndSortAscendingWeekEntriesMock.mockImplementation(
    dataPoints => dataPoints,
  )
  getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
})

describe('getTechDebtTrendBySeverityChartData', () => {
  it('should have the total tech debts by severity by week of a team metrics', () => {
    const expected: TechDebtTrendBySeverityChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        highSeverityTechDebts: 1,
        mediumSeverityTechDebts: 5,
        lowSeverityTechDebts: 6,
      },
      {
        xAxisTick: 'dontcare-2',
        highSeverityTechDebts: 2,
        mediumSeverityTechDebts: 3,
        lowSeverityTechDebts: 4,
      },
    ]

    expect(
      getTechDebtTrendBySeverityChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                maintainabilityHighSeverityIssues: 1,
                maintainabilityMediumSeverityIssues: 5,
                maintainabilityLowSeverityIssues: 6,
              },
              {
                week: 'dontcare-2',
                maintainabilityHighSeverityIssues: 2,
                maintainabilityMediumSeverityIssues: 3,
                maintainabilityLowSeverityIssues: 4,
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
  it('should render with severity amount and percent of tech debts and total for the week', () => {
    RenderWithWrapper(
      <ChartTooltip
        active
        payload={[
          {
            name: 'High Severity Tech Debts',
            value: 1,
            color: 'rbg(0, 0, 0)',
          },
          {
            name: 'Medium Severity Tech Debts',
            value: 2,
            color: 'rbg(1, 1, 1)',
          },
          {
            name: 'Low Severity Tech Debts',
            value: 3,
            color: 'rbg(2, 2, 2)',
          },
        ]}
      />,
    )

    expect(
      screen.getByLabelText('High Severity Tech Debts Value'),
    ).toHaveTextContent('1 (16.7%)')
    expect(
      screen.getByLabelText('Medium Severity Tech Debts Value'),
    ).toHaveTextContent('2 (33.3%)')
    expect(
      screen.getByLabelText('Low Severity Tech Debts Value'),
    ).toHaveTextContent('3 (50%)')
    expect(screen.getByLabelText('Total Value')).toHaveTextContent('6')
  })
})

describe('TechDebtTrendBySeverityChart', () => {
  it('should call LineChart with the computed data', () => {
    const mockData: TechDebtTrendBySeverityChartProps['data'] = [
      {
        xAxisTick: 'foo-bar',
        highSeverityTechDebts: 1,
        mediumSeverityTechDebts: 1,
        lowSeverityTechDebts: 1,
      },
    ]

    RenderWithWrapper(<TechDebtTrendBySeverityChart data={mockData} />)

    expect(MockLineChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
