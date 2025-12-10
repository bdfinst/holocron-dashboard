import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { TeamMetrics } from 'api'
import { screen } from '@testing-library/react'
import VulnerabilitiesTrendBySeverityChart, {
  VulnerabilitiesTrendBySeverityChartProps,
  getVulnerabilitiesTrendBySeverityChartData,
  ChartTooltip,
} from './VulnerabilitiesTrendBySeverityChart'

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

describe('getVulnerabilitiesTrendBySeverityChartData', () => {
  it('should have the total vulnerabilities by severity by week of a team metrics', () => {
    const expected: VulnerabilitiesTrendBySeverityChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        highSeverityVulnerabilities: 1,
        mediumSeverityVulnerabilities: 5,
        lowSeverityVulnerabilities: 6,
      },
      {
        xAxisTick: 'dontcare-2',
        highSeverityVulnerabilities: 2,
        mediumSeverityVulnerabilities: 3,
        lowSeverityVulnerabilities: 4,
      },
    ]

    expect(
      getVulnerabilitiesTrendBySeverityChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                highSeverityVulnerabilities: 1,
                mediumSeverityVulnerabilities: 5,
                lowSeverityVulnerabilities: 6,
              },
              {
                week: 'dontcare-2',
                highSeverityVulnerabilities: 2,
                mediumSeverityVulnerabilities: 3,
                lowSeverityVulnerabilities: 4,
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
  it('should render with severity amount and percent of vulnerabilities and total for the week', () => {
    RenderWithWrapper(
      <ChartTooltip
        active
        payload={[
          {
            name: 'High Severity Vulnerabilities',
            value: 1,
            color: 'rbg(0, 0, 0)',
          },
          {
            name: 'Medium Severity Vulnerabilities',
            value: 2,
            color: 'rbg(1, 1, 1)',
          },
          {
            name: 'Low Severity Vulnerabilities',
            value: 3,
            color: 'rbg(2, 2, 2)',
          },
        ]}
      />,
    )

    expect(
      screen.getByLabelText('High Severity Vulnerabilities Value'),
    ).toHaveTextContent('1 (16.7%)')
    expect(
      screen.getByLabelText('Medium Severity Vulnerabilities Value'),
    ).toHaveTextContent('2 (33.3%)')
    expect(
      screen.getByLabelText('Low Severity Vulnerabilities Value'),
    ).toHaveTextContent('3 (50%)')
    expect(screen.getByLabelText('Total Value')).toHaveTextContent('6')
  })
})

describe('VulnerabilitiesTrendBySeverityChart', () => {
  it('should call LineChart with the computed data', () => {
    const mockData: VulnerabilitiesTrendBySeverityChartProps['data'] = [
      {
        xAxisTick: 'foo-bar',
        highSeverityVulnerabilities: 1,
        mediumSeverityVulnerabilities: 1,
        lowSeverityVulnerabilities: 1,
      },
    ]

    RenderWithWrapper(<VulnerabilitiesTrendBySeverityChart data={mockData} />)

    expect(MockLineChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
