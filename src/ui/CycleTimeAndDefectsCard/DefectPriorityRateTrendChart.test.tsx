import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { screen } from '@testing-library/react'
import { TeamMetrics } from 'api'
import DefectPriorityRateTrendChart, {
  ChartTooltip,
  DefectPriorityRateTrendChartProps,
  getDefectPriorityRateTrendChartData,
} from './DefectPriorityRateTrendChart'

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

describe('getDefectPriorityRateTrendChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should have the total of each priority type of defect with each week', () => {
    const expected: DefectPriorityRateTrendChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        // total sum of all weeks of key dontcare-1,
        // for all team's historical data
        // for each category.
        highestPriorityDefectsCreated: 6,
        highPriorityDefectsCreated: 6,
        mediumPriorityDefectsCreated: 6,
        lowPriorityDefectsCreated: 6,
        lowestPriorityDefectsCreated: 6,
      },
      {
        xAxisTick: 'dontcare-2',
        highestPriorityDefectsCreated: 6,
        highPriorityDefectsCreated: 6,
        mediumPriorityDefectsCreated: 6,
        lowPriorityDefectsCreated: 6,
        lowestPriorityDefectsCreated: 6,
      },
      {
        xAxisTick: 'dontcare-3',
        highestPriorityDefectsCreated: 6,
        highPriorityDefectsCreated: 6,
        mediumPriorityDefectsCreated: 6,
        lowPriorityDefectsCreated: 6,
        lowestPriorityDefectsCreated: 6,
      },
      {
        xAxisTick: 'dontcare-4',
        highestPriorityDefectsCreated: 6,
        highPriorityDefectsCreated: 6,
        mediumPriorityDefectsCreated: 6,
        lowPriorityDefectsCreated: 6,
        lowestPriorityDefectsCreated: 6,
      },
    ]
    expect(
      getDefectPriorityRateTrendChartData({
        apiMetrics: [
          {
            historicalData: [
              {
                week: 'dontcare-1',
                highestPriorityDefectsCreated: 3,
                highPriorityDefectsCreated: 3,
                mediumPriorityDefectsCreated: 3,
                lowPriorityDefectsCreated: 3,
                lowestPriorityDefectsCreated: 3,
              },
              {
                week: 'dontcare-2',
                highestPriorityDefectsCreated: 3,
                highPriorityDefectsCreated: 3,
                mediumPriorityDefectsCreated: 3,
                lowPriorityDefectsCreated: 3,
                lowestPriorityDefectsCreated: 3,
              },
              {
                week: 'dontcare-3',
                highestPriorityDefectsCreated: 3,
                highPriorityDefectsCreated: 3,
                mediumPriorityDefectsCreated: 3,
                lowPriorityDefectsCreated: 3,
                lowestPriorityDefectsCreated: 3,
              },
              {
                week: 'dontcare-4',
                highestPriorityDefectsCreated: 3,
                highPriorityDefectsCreated: 3,
                mediumPriorityDefectsCreated: 3,
                lowPriorityDefectsCreated: 3,
                lowestPriorityDefectsCreated: 3,
              },
            ],
          },
          {
            historicalData: [
              {
                week: 'dontcare-1',
                highestPriorityDefectsCreated: 3,
                highPriorityDefectsCreated: 3,
                mediumPriorityDefectsCreated: 3,
                lowPriorityDefectsCreated: 3,
                lowestPriorityDefectsCreated: 3,
              },
              {
                week: 'dontcare-2',
                highestPriorityDefectsCreated: 3,
                highPriorityDefectsCreated: 3,
                mediumPriorityDefectsCreated: 3,
                lowPriorityDefectsCreated: 3,
                lowestPriorityDefectsCreated: 3,
              },
              {
                week: 'dontcare-3',
                highestPriorityDefectsCreated: 3,
                highPriorityDefectsCreated: 3,
                mediumPriorityDefectsCreated: 3,
                lowPriorityDefectsCreated: 3,
                lowestPriorityDefectsCreated: 3,
              },
              {
                week: 'dontcare-4',
                highestPriorityDefectsCreated: 3,
                highPriorityDefectsCreated: 3,
                mediumPriorityDefectsCreated: 3,
                lowPriorityDefectsCreated: 3,
                lowestPriorityDefectsCreated: 3,
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
  it('should show the each defect priority with percentage and total', () => {
    RenderWithWrapper(
      <ChartTooltip
        active
        payload={[
          {
            name: 'Highest Priority',
            value: 1,
            color: 'rbg(0, 0, 0)',
          },
          {
            name: 'High Priority',
            value: 2,
            color: 'rbg(1, 1, 1)',
          },
          {
            name: 'Medium Priority',
            value: 3,
            color: 'rbg(2, 2, 2)',
          },
          {
            name: 'Low Priority',
            value: 4,
            color: 'rbg(3, 3, 3)',
          },
          {
            name: 'Lowest Priority',
            value: 5,
            color: 'rbg(4, 4, 4)',
          },
        ]}
      />,
    )

    expect(screen.getByLabelText('Highest Priority Value')).toHaveTextContent(
      '1 (6.7%)',
    )
    expect(screen.getByLabelText('High Priority Value')).toHaveTextContent(
      '2 (13.3%)',
    )
    expect(screen.getByLabelText('Medium Priority Value')).toHaveTextContent(
      '3 (20%)',
    )
    expect(screen.getByLabelText('Low Priority Value')).toHaveTextContent(
      '4 (26.7%)',
    )
    expect(screen.getByLabelText('Lowest Priority Value')).toHaveTextContent(
      '5 (33.3%)',
    )
    expect(screen.getByLabelText('Total Value')).toHaveTextContent('15')
  })
})

describe('DefectPriorityRateTrendChart', () => {
  it('should call LineChart with the computed data', () => {
    const mockData: DefectPriorityRateTrendChartProps['data'] = [
      {
        xAxisTick: 'foo-bar',
        highestPriorityDefectsCreated: 1,
        highPriorityDefectsCreated: 1,
        mediumPriorityDefectsCreated: 1,
        lowPriorityDefectsCreated: 1,
        lowestPriorityDefectsCreated: 1,
      },
    ]

    RenderWithWrapper(<DefectPriorityRateTrendChart data={mockData} />)

    expect(MockLineChartDataSpy).toHaveBeenCalledWith(mockData)
  })
})
