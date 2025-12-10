import { render, screen } from '@testing-library/react'
import { TeamMetrics } from 'api'
import StaleCodeReviewsTable, {
  getStaleCodeReviews,
} from './StaleCodeReviewsTable'

jest.mock('./StaleCodeReviewsTableHelpContent.md', () => 'helpContent')

jest.mock('globalConfig', () => ({
  __esModule: true,
  default: {
    ...jest.requireActual('globalConfig').default,
    METRICS_SETTINGS: {
      ...jest.requireActual('globalConfig').default.METRICS_SETTINGS,
      OUTDATED_MERGE_REQUEST_TIME_HOURS: 1,
    },
  },
}))

describe('getStaleCodeReviews', () => {
  beforeAll(() => {
    jest.useFakeTimers({ now: new Date('2021-06-14') })
    expect(new Date().getTime()).toEqual(new Date('2021-06-14').getTime())
  })

  it('should map stale code reviews over to data needed for the table', () => {
    const expected = [
      {
        url: 'https://github.com/repo-shouldcare/-/merge_requests/request-1',
        title: 'MR',
        ageInHours: 0,
      },
      {
        url: 'https://github.com/repo-shouldcare/-/merge_requests/request-2',
        title: 'outdated-MR',
        ageInHours: 7 * 24, // MR is 7 days old, which is 7 * 24 hours old.
      },
    ]
    expect(
      getStaleCodeReviews({
        apiMetrics: [
          {
            staleGitRequests: [
              {
                url: 'https://github.com/repo-shouldcare/-/merge_requests/request-1',
                lastUpdated: new Date().toISOString(),
                title: 'MR',
              },
              {
                url: 'https://github.com/repo-shouldcare/-/merge_requests/request-2',
                lastUpdated: (() => {
                  const now = new Date()
                  const sevenDaysAgo = now
                  sevenDaysAgo.setDate(now.getDate() - 7)
                  return sevenDaysAgo.toISOString()
                })(),
                title: 'outdated-MR',
              },
            ],
          },
        ] as TeamMetrics[],
      }),
    ).toEqual(expected)
  })
})

describe('StaleCodeReviewsTable', () => {
  it('should render stale code reviews in descending order based on age of code review', () => {
    const rows = [
      {
        url: 'bar',
        title: 'bar',
        ageInHours: 1,
      },
      {
        url: 'foo',
        title: 'foo',
        ageInHours: 24,
      },
    ]
    render(<StaleCodeReviewsTable data={rows} />)

    const tableRows = screen.getAllByRole('row')
    const expectedRowNames = [
      ['Overdue', 'Code Review', 'Open For (Hours)'].join(''), // the columns row
      ['foo', '24'].join(''),
      ['bar', '1'].join(''),
    ]
    tableRows.forEach((row, i) => {
      expect(row).toHaveTextContent(expectedRowNames[i])
    })
  })
})
