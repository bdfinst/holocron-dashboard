import { render, screen } from '@testing-library/react'
import { BuildStatus, TeamMetrics } from 'api'
import StalePipelinesTable, { getStalePipelines } from './StalePipelinesTable'

jest.mock('./StalePipelinesTableHelpContent.md', () => 'helpContent')

jest.mock('globalConfig', () => ({
  __esModule: true,
  default: {
    ...jest.requireActual('globalConfig').default,
    METRICS_SETTINGS: {
      ...jest.requireActual('globalConfig').default.METRICS_SETTINGS,
      OUTDATED_PIPELINE_TIME_DAYS: 5,
    },
  },
}))

describe('getStalePipelines', () => {
  beforeAll(() => {
    jest.useFakeTimers({ now: new Date('2021-06-14') })
    expect(new Date().getTime()).toEqual(new Date('2021-06-14').getTime())
  })

  it('should get the stale pipelines for a given team (pipelines not run a long time)', () => {
    const expected = [
      {
        durationInHours: 1,
        ageInDays: 10,
        buildUrl: 'https://github.com/repo-shouldnotcare/-/pipelines/5678',
      },
    ]
    expect(
      getStalePipelines({
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
                buildStatus: BuildStatus.PASSED,
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
                buildStatus: BuildStatus.PASSED,
              },
            ],
          },
        ] as TeamMetrics[],
      }),
    ).toEqual(expected)
  })
})

describe('StalePipelinesTable', () => {
  it('should sort the stale pipelines in descending order by age in days since the pipeline was run', () => {
    const rows = [
      {
        buildUrl: 'foo',
        ageInDays: 10,
        durationInHours: 1,
      },
      {
        buildUrl: 'bar',
        ageInDays: 23,
        durationInHours: 1,
      },
    ]
    render(<StalePipelinesTable data={rows} />)

    const tableRows = screen.getAllByRole('row')
    const expectedRowNames = [
      ['Build', 'Run Time (Hours)', 'Last Run (Days)'].join(''), // the columns row
      ['bar', '1', '23'].join(''),
      ['foo', '1', '10'].join(''),
    ]
    tableRows.forEach((row, i) => {
      expect(row).toHaveTextContent(expectedRowNames[i])
    })
  })
})
