import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { screen, within } from '@testing-library/react'
import { TeamMetrics } from 'api'
import CumulativeFlowCard, {
  CumulativeFlowChartProps,
  getCumulativeWorkflowChartData,
} from '.'

const MockBarChartDataSpy = jest.fn()

jest.mock('./helpContent.md', () => 'helpContent')

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({
    data,
    children,
  }: {
    data: unknown
    children: React.ReactNode
  }) => {
    MockBarChartDataSpy(data)
    return <svg>{children}</svg>
  },
  Bar: () => <div data-testid="Bar" />,
  Legend: () => <div data-testid="Legend" />,
  Tooltip: () => <div data-testid="Tooltip" />,
  XAxis: () => <div data-testid="XAxis" />,
  YAxis: () => <div data-testid="YAxis" />,
}))

jest.mock('utils/DashboardWidgetWrapper', () => ({
  ...jest.requireActual('utils/DashboardWidgetWrapper'),
  __esModule: true,
  default: ({ children, AdditionalInformation }) => (
    <div>
      <>{children}</>
      <div data-testid="AdditionalInformation">{AdditionalInformation}</div>
    </div>
  ),
  padAndSortAscendingWeekEntires: jest.fn(),
  getMonthAndMondayDayLabel: jest.fn(),
  getLastUpdatedMessage: jest.fn().mockReturnValue({}),
}))

jest.mock('./CumulativeWorkflowChartDetailsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="CumulativeWorkflowChartDetailsTable" />,
  getCumulativeWorkflowChartDetailsTableData: jest.fn().mockReturnValue({
    averageAgeOfBacklogTickets: '31',
    amountOfOutdatedTickets: '3',
  }),
}))

const padAndSortAscendingWeekEntriesMock =
  padAndSortAscendingWeekEntires as jest.Mock
const getMonthAndMondayDayLabelMock = getMonthAndMondayDayLabel as jest.Mock

const mockApiMetrics = [
  {
    historicalData: [
      {
        week: 'dontcare-1',
        totalTicketsInBacklog: 3,
        totalTicketsInProgress: 3,
      },
      {
        week: 'dontcare-2',
        totalTicketsInBacklog: 3,
        totalTicketsInProgress: 2,
      },
      {
        week: 'dontcare-3',
        totalTicketsInBacklog: 2,
        totalTicketsInProgress: 2,
      },
      {
        week: 'dontcare-4',
        totalTicketsInBacklog: 0,
        totalTicketsInProgress: 0,
      },
    ],
  },
  {
    historicalData: [
      {
        week: 'dontcare-1',
        totalTicketsInBacklog: 3,
        totalTicketsInProgress: 3,
      },
      {
        week: 'dontcare-2',
        totalTicketsInBacklog: 3,
        totalTicketsInProgress: 1,
      },
      {
        week: 'dontcare-3',
        totalTicketsInBacklog: 1,
        totalTicketsInProgress: 1,
      },
    ],
  },
] as TeamMetrics[]

describe('getCumulativeWorkflowChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('should have the amount of issues in backlog and in progress for each point', () => {
    const expected: CumulativeFlowChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        // 3 + 3 should sum to 6 for this week
        // for both this categories for all teams
        // in the input
        amountOfTicketsInBacklog: 6,
        amountOfTicketsInProgress: 6,
      },
      {
        xAxisTick: 'dontcare-2',
        // 3 + 3 should sum to 6 for amountOfTicketsInBacklog
        // for this week for this category
        amountOfTicketsInBacklog: 6,
        // 2 + 1 should sum to 3 for this week in this category
        amountOfTicketsInProgress: 3,
      },
      // likewise, the following are expected
      {
        xAxisTick: 'dontcare-3',
        amountOfTicketsInBacklog: 3,
        amountOfTicketsInProgress: 3,
      },
      {
        xAxisTick: 'dontcare-4',
        amountOfTicketsInBacklog: 0,
        amountOfTicketsInProgress: 0,
      },
    ]

    expect(
      getCumulativeWorkflowChartData({
        apiMetrics: mockApiMetrics,
        weekRange: 4,
      }),
    ).toEqual(expected)
  })
})

describe('CumulativeWorkflowCard', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it('it should call the CumulativeWorkflowChart with the mocked data', () => {
    const expected: CumulativeFlowChartProps['data'] = [
      {
        xAxisTick: 'dontcare-1',
        amountOfTicketsInBacklog: 6,
        amountOfTicketsInProgress: 6,
      },
      {
        xAxisTick: 'dontcare-2',
        amountOfTicketsInBacklog: 6,
        amountOfTicketsInProgress: 3,
      },
      {
        xAxisTick: 'dontcare-3',
        amountOfTicketsInBacklog: 3,
        amountOfTicketsInProgress: 3,
      },
      {
        xAxisTick: 'dontcare-4',
        amountOfTicketsInBacklog: 0,
        amountOfTicketsInProgress: 0,
      },
    ]
    RenderWithWrapper(
      <CumulativeFlowCard apiMetrics={mockApiMetrics} weekRange={4} />,
    )
    expect(MockBarChartDataSpy).toHaveBeenCalledWith(expected)
  })

  it('should render with CumulativeFlowChartDetailsTable in additional information', () => {
    RenderWithWrapper(
      <CumulativeFlowCard apiMetrics={mockApiMetrics} weekRange={4} />,
    )
    const { getByTestId } = within(
      // first card wrapper additional information is what we are
      // interested in in the ui.
      screen.getAllByTestId('AdditionalInformation')[0],
    )
    expect(
      getByTestId('CumulativeWorkflowChartDetailsTable'),
    ).toBeInTheDocument()
  })
})
