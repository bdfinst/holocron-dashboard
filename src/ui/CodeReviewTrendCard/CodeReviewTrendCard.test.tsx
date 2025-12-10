import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { screen } from '@testing-library/react'
import { TeamMetrics } from 'api'
import CodeReviewTrendCard, {
  CodeReviewTrendChartProps,
  getCodeReviewTrendChartData,
} from '.'

const MockAreaChartDataSpy = jest.fn()

jest.mock('./helpContent.md', () => 'helpContent')

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
  __esModule: true,
  default: jest.requireActual('utils/DashboardWidgetWrapper').default,
  padAndSortAscendingWeekEntires: jest.fn(),
  getMonthAndMondayDayLabel: jest.fn(),
  getLastUpdatedMessage: jest.fn().mockReturnValue({}),
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

const mockTeamMetrics = [
  {
    historicalData: [
      {
        week: 'dontcare-1',
        averageAgeInDaysCodeReviewWasOpen: 3.3333333333333335,
      },
      {
        week: 'dontcare-2',
        averageAgeInDaysCodeReviewWasOpen: 1,
      },
      { week: 'dontcare-3', averageAgeInDaysCodeReviewWasOpen: 1.5 },
      {
        week: 'dontcare-4',
        averageAgeInDaysCodeReviewWasOpen: 2.5,
      },
    ],
  },
] as TeamMetrics[]

const expectedCodeReviewTrendChartData: CodeReviewTrendChartProps['data'] = [
  {
    xAxisTick: 'dontcare-1',
    // 3.333... rounded to 2 decimal places if needed
    averageAgeInDaysCodeReviewWasOpen: 3.33,
  },
  {
    xAxisTick: 'dontcare-2',
    // 1 rounded to 2 decimal places if needed
    averageAgeInDaysCodeReviewWasOpen: 1,
  },
  {
    xAxisTick: 'dontcare-3',
    // 1.5 rounded to 2 decimal places if needed
    averageAgeInDaysCodeReviewWasOpen: 1.5,
  },
  {
    xAxisTick: 'dontcare-4',
    // 2.5 rounded to 2 decimal places if need
    averageAgeInDaysCodeReviewWasOpen: 2.5,
  },
]

describe('getCodeReviewTrendChartData', () => {
  it('should take all the averageAgeInDaysCodeReviewWasOpen from teamMetrics and round it to 2 decimal places', () => {
    expect(
      getCodeReviewTrendChartData({
        apiMetrics: mockTeamMetrics,
        weekRange: 4,
      }),
    ).toEqual(expectedCodeReviewTrendChartData)
  })
})

describe('CodeReviewTrendCard', () => {
  it('should render with the area chart with provided mock data', () => {
    RenderWithWrapper(
      <CodeReviewTrendCard apiMetrics={mockTeamMetrics} weekRange={4} />,
    )

    expect(screen.getByTestId('Area')).toBeInTheDocument()
    expect(MockAreaChartDataSpy).toHaveBeenCalledWith(
      expectedCodeReviewTrendChartData,
    )
  })
})
