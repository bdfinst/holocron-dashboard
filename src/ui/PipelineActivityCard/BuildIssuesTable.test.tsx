import { render, screen } from '@testing-library/react'
import { BuildStatus, TeamMetrics } from 'api'
import BuildIssuesTable, { getBuildIssues } from './BuildIssuesTable'

jest.mock('./BuildIssuesTableHelpContent.md', () => 'helpContent')

describe('getBuildIssues', () => {
  beforeAll(() => {
    jest.useFakeTimers({ now: new Date('2021-06-14') })
    expect(new Date().getTime()).toEqual(new Date('2021-06-14').getTime())
  })

  afterAll(jest.useRealTimers)

  it('should return a formatted data that can be shown in table (builds with issues--i.e. passed with warnings, or failed)', () => {
    const expected = [
      {
        durationInHours: 1,
        buildUrl: 'https://github.com/repo-shouldcare/-/pipelines/1234',
        ageInMinutes: 0,
        failedBuild: true,
      },
      {
        durationInHours: 1,
        buildUrl: 'https://github.com/repo-shouldnotcare/-/pipelines/5678',
        ageInMinutes: 10 * 24 * 60,
        failedBuild: false,
      },
    ]
    expect(
      getBuildIssues({
        apiMetrics: [
          {
            latestBuilds: [
              {
                buildUrl: 'https://github.com/repo-shouldcare/-/pipelines/1234',
                startTime: (() => {
                  const now = new Date()
                  const oneHourAgo = now
                  oneHourAgo.setHours(now.getHours() - 1)
                  return oneHourAgo.toISOString()
                })(),
                endTime: new Date().toISOString(),
                buildStatus: BuildStatus.FAILED,
              },
              {
                buildUrl:
                  'https://github.com/repo-shouldnotcare/-/pipelines/5678',
                startTime: (() => {
                  const now = new Date()
                  const tenDaysOneHourAgo = now
                  tenDaysOneHourAgo.setDate(now.getDate() - 10)
                  tenDaysOneHourAgo.setHours(tenDaysOneHourAgo.getHours() - 1)
                  return tenDaysOneHourAgo.toISOString()
                })(),
                endTime: (() => {
                  const now = new Date()
                  const tenDaysAgo = now
                  tenDaysAgo.setDate(now.getDate() - 10)
                  return tenDaysAgo.toISOString()
                })(),
                buildStatus: BuildStatus.PASSED_WITH_WARNINGS,
              },
            ],
          },
        ] as TeamMetrics[],
      }),
    ).toEqual(expected)
  })
})

describe('BuildIssuesTable', () => {
  it('should render with the build issues ordered by ageInMinutes property', () => {
    const rows = [
      {
        durationInHours: 1,
        buildUrl: 'foo',
        ageInMinutes: 60,
        failedBuild: true,
      },
      {
        durationInHours: 1,
        buildUrl: 'bar',
        ageInMinutes: 30,
        failedBuild: false,
      },
    ]
    render(<BuildIssuesTable data={rows} />)

    const tableRows = screen.getAllByRole('row')
    const expectedRowNames = [
      [
        'Status',
        'Build',
        'Run Time (Hours)',
        'Time Since Detection (Minutes)',
      ].join(''), // the columns row
      ['foo', '1', '60'].join(''), // first row with values, "foo" "1" and "60"
      ['bar', '1', '30'].join(''),
    ]
    tableRows.forEach((row, i) => {
      expect(row).toHaveTextContent(expectedRowNames[i])
    })
  })
})
