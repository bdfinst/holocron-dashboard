import { render, screen } from '@testing-library/react'
import { TeamMetrics } from 'api'
import StaleBranchesTable, { getStaleBranches } from './StaleBranchesTable'

jest.mock('./StaleBranchesTableHelpContent.md', () => 'helpContent')

jest.mock('globalConfig', () => ({
  __esModule: true,
  default: {
    ...jest.requireActual('globalConfig').default,
    METRICS_SETTINGS: {
      ...jest.requireActual('globalConfig').default.METRICS_SETTINGS,
      OUTDATED_BRANCHES_TIME_DAYS: 1,
    },
  },
}))

describe('getStaleBranches', () => {
  beforeAll(() => {
    jest.useFakeTimers({ now: new Date('2021-06-14') })
    expect(new Date().getTime()).toEqual(new Date('2021-06-14').getTime())
  })

  afterAll(() => jest.useRealTimers())

  it('should map over the stale branches for a given team metrics', () => {
    const expected = [
      {
        url: 'https://shouldcare.com/repo-shouldcare/-/tree/branch-1',
        name: 'should-see-this',
        ageInDays: 7,
      },
    ]
    expect(
      getStaleBranches({
        apiMetrics: [
          {
            staleBranches: [
              {
                url: 'https://shouldnotcare.com/repo-shouldnotcare/-/tree/branch-1',
                lastUpdated: new Date().toISOString(),
                name: 'should-not-see-this',
              },
              {
                url: 'https://shouldcare.com/repo-shouldcare/-/tree/branch-1',
                lastUpdated: (() => {
                  const now = new Date()
                  const sevenDaysAgo = now
                  sevenDaysAgo.setDate(now.getDate() - 7)
                  return sevenDaysAgo.toISOString()
                })(),
                name: 'should-see-this',
              },
            ],
          },
        ] as TeamMetrics[],
      }),
    ).toEqual(expected)
  })
})

describe('StaleBranchesTable', () => {
  it('should render with the stale branches in descending order of age', () => {
    const rows = [
      {
        url: 'bar',
        ageInDays: 23,
        name: 'bar',
      },
      {
        url: 'foo',
        ageInDays: 24,
        name: 'foo',
      },
    ]
    render(<StaleBranchesTable data={rows} />)

    const tableRows = screen.getAllByRole('row')
    const expectedRowNames = [
      ['Branch', 'Days'].join(''), // the columns row
      ['foo', '24'].join(''), // first row with values, "foo" and "24"
      ['bar', '23'].join(''),
    ]
    tableRows.forEach((row, i) => {
      expect(row).toHaveTextContent(expectedRowNames[i])
    })
  })
})
