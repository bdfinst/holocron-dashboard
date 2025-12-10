import { render, screen } from '@testing-library/react'
import { TeamMetrics } from 'api'
import CumulativeWorkflowChartDetailsTable, {
  getCumulativeWorkflowChartDetailsTableData,
} from './CumulativeWorkflowChartDetailsTable'

describe('getCumulativeFlowChartDetailsTableData', () => {
  it('should return the average age of issues in backlog and number of stale issues in backlog', () => {
    jest.useFakeTimers({ now: new Date('2021-01-25') })
    expect(new Date().getTime()).toEqual(new Date('2021-01-25').getTime())
    expect(
      getCumulativeWorkflowChartDetailsTableData({
        apiMetrics: [
          {
            staleBacklogTickets: 2,
            ageOfTicketsInBacklog: [
              {
                days: 40,
              },
            ],
          },
          {
            staleBacklogTickets: 1,
            ageOfTicketsInBacklog: [
              {
                days: 22,
              },
            ],
          },
        ] as TeamMetrics[],
      }),
    ).toEqual({
      // average should be sum([40, 22]) / 2 = 31 days
      averageAgeOfBacklogTickets: '31',
      // total should be 2 + 1 = 3
      amountOfOutdatedTickets: '3',
    })
  })

  it('if the amount of issues in backlog is 0, and the amount of stale tickets is 0, it should sow N/A for both categories', () => {
    expect(
      getCumulativeWorkflowChartDetailsTableData({
        apiMetrics: [
          {
            staleBacklogTickets: 0,
            ageOfTicketsInBacklog: [],
          },
          {
            staleBacklogTickets: 0,
            ageOfTicketsInBacklog: [],
          },
        ] as TeamMetrics[],
      }),
    ).toEqual({
      averageAgeOfBacklogTickets: 'N/A',
      amountOfOutdatedTickets: 'N/A',
    })
  })
})

describe('CumulativeWorkflowChartDetailsTable', () => {
  it('should render with average age of tickets in back log, and number of tickets in backlog', () => {
    render(
      <CumulativeWorkflowChartDetailsTable
        averageAgeOfBacklogTickets="5"
        amountOfOutdatedTickets="5"
      />,
    )

    expect(
      screen.getByLabelText('Average Age of Tickets in Backlog Value'),
    ).toHaveTextContent('5')
    expect(
      screen.getByLabelText('Number of Tickets with Age past 30 days Value'),
    ).toHaveTextContent('5')
  })
})
