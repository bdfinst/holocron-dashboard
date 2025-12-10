import { render, screen } from '@testing-library/react'
import { TeamMetrics } from 'api'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { getLastUpdatedMessage } from 'utils/DashboardWidgetWrapper'
import WipLoadGaugeCard, { ChartTooltip, getWipGaugeData } from '.'

jest.mock('recharts', () => ({
  Cell: () => <div data-testid="Cell" />,
  Label: ({ content }: { content: React.ReactNode }) => (
    <div data-testid="Label">{content}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="Pie">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <svg>{children}</svg>
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => <div data-testid="Tooltip" />,
}))

jest.mock('./helpContent.md', () => 'helpContent')

jest.mock('utils/DashboardWidgetWrapper', () => ({
  ...jest.requireActual('utils/DashboardWidgetWrapper'),
  __esModule: true,
  default: jest.requireActual('utils/DashboardWidgetWrapper').default,
  getLastUpdatedMessage: jest.fn(),
}))

const getLastUpdatedMessageMock = getLastUpdatedMessage as jest.Mock

beforeAll(() => {
  getLastUpdatedMessageMock.mockReturnValue({ workflow: 0 })
})

describe('getWipGaugeData', () => {
  describe('wip aggregation', () => {
    it('should aggregate and calculate the wip percent for the list of team metrics', () => {
      const { numberOfIssuesInProgress, teamSize, wipLoad } = getWipGaugeData({
        apiMetrics: [
          {
            name: 'biz-baz',
            wipTickets: 4,
            teamSize: 5,
          },
          {
            name: 'fizz-buzz',
            wipTickets: 5,
            teamSize: 5,
          },
          {
            name: 'foo-fizz',
            wipTickets: 5,
            teamSize: 5,
          },
        ] as TeamMetrics[],
      })
      expect(numberOfIssuesInProgress).toEqual(4 + 5 + 5) // adding wipLoadData
      expect(teamSize).toEqual(5 + 5 + 5) // adding teamSize in team metrics
      expect(wipLoad).toEqual(93.3) // ((4 + 5 + 5) / (5 + 5 + 5)) * 100
    })
  })
})

describe('ChartTooltip', () => {
  it('should render with the current wip load, and the sector value for wip load description', () => {
    render(
      <ChartTooltip
        active
        payload={[
          {
            payload: {
              name: 'Fair',
              area: 24,
              isHighlighted: true,
              isCurrentWipLoad: true,
              tooltipDescription: '"Fair": less than or equal to',
              tooltipWipLoadThreshold: 150,
              color: 'yellow',
            },
          },
        ]}
        currentWipLoad={148}
      />,
    )
    expect(screen.getByText('Current WIP Load:')).toBeInTheDocument()
    expect(screen.getByText(148)).toBeInTheDocument()
    expect(
      screen.getByText('"Fair": less than or equal to'),
    ).toBeInTheDocument()
    expect(screen.getByText(150)).toBeInTheDocument()
  })
})

describe('WipLoadGauge', () => {
  describe('different wip load categories range', () => {
    it('should show "Really good" wip load in case of "Really good" wip load', () => {
      RenderWithWrapper(
        <WipLoadGaugeCard
          apiMetrics={
            [
              {
                wipTickets: 1,
                teamSize: 5,
              },
            ] as TeamMetrics[]
          }
        />,
      )

      expect(screen.getByText('Really Good')).toBeInTheDocument()
    })

    it('should show "Good" wip load in case of "Good" wip load', () => {
      RenderWithWrapper(
        <WipLoadGaugeCard
          apiMetrics={
            [
              {
                wipTickets: 4,
                teamSize: 5,
              },
            ] as TeamMetrics[]
          }
        />,
      )

      expect(screen.getByText('Good')).toBeInTheDocument()
    })

    it('should show "Fair" wip load in case of "Fair" wip load', () => {
      RenderWithWrapper(
        <WipLoadGaugeCard
          apiMetrics={
            [
              {
                wipTickets: 6,
                teamSize: 5,
              },
            ] as TeamMetrics[]
          }
        />,
      )

      expect(screen.getByText('Fair')).toBeInTheDocument()
    })

    it('should show "Poor" wip load in case of "Poor" wip load', () => {
      RenderWithWrapper(
        <WipLoadGaugeCard
          apiMetrics={
            [
              {
                wipTickets: 10,
                teamSize: 5,
              },
            ] as TeamMetrics[]
          }
        />,
      )

      expect(screen.getByText('Poor')).toBeInTheDocument()
    })

    it('should show "Over Loaded" wip load in case of "Over Loaded" wip load', () => {
      RenderWithWrapper(
        <WipLoadGaugeCard
          apiMetrics={
            [
              {
                wipTickets: 11,
                teamSize: 5,
              },
            ] as TeamMetrics[]
          }
        />,
      )

      expect(screen.getByText('Over Loaded')).toBeInTheDocument()
    })
  })
})
