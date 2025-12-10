import { createTeamView } from '__mocks__/TeamViews'
import { createTeam } from '__mocks__/Teams'
import { createValueStream } from '__mocks__/ValueStreams'
import { TeamMetrics } from 'api'
import { createOrganization } from '__mocks__/Organizations'
import {
  getLastUpdatedMessage,
  getMonthAndMondayDayLabel,
  filterTeamMetricsList,
  padAndSortAscendingWeekEntires,
  safeDivide,
  roundValue,
  axisMaxDomain,
  getDaysAgo,
  getHoursAgo,
  getMinutesAgo,
  getMondayOfCurrentWeek,
} from './utils'

describe('getMonthAndMondayDayLabel', () => {
  it('should format week labels for monday of the week in yyyy-mm-dd format to "month" "day" format', () => {
    const year2021Weeks = {
      '2020-12-28': 'Dec 28',
      '2021-01-04': 'Jan 04',
      '2021-01-11': 'Jan 11',
      '2021-01-25': 'Jan 25',
      '2021-02-01': 'Feb 01',
      '2021-02-08': 'Feb 08',
      '2021-02-15': 'Feb 15',
      '2021-02-22': 'Feb 22',
      '2021-03-01': 'Mar 01',
      '2021-03-08': 'Mar 08',
      '2021-03-15': 'Mar 15',
      '2021-03-22': 'Mar 22',
      '2021-03-29': 'Mar 29',
      '2021-04-05': 'Apr 05',
      '2021-04-12': 'Apr 12',
      '2021-04-19': 'Apr 19',
      '2021-04-26': 'Apr 26',
      '2021-05-03': 'May 03',
      '2021-05-10': 'May 10',
      '2021-05-17': 'May 17',
      '2021-05-24': 'May 24',
      '2021-05-31': 'May 31',
      '2021-06-07': 'Jun 07',
      '2021-06-14': 'Jun 14',
      '2021-06-21': 'Jun 21',
      '2021-06-28': 'Jun 28',
      '2021-07-05': 'Jul 05',
      '2021-07-12': 'Jul 12',
      '2021-07-19': 'Jul 19',
      '2021-07-26': 'Jul 26',
      '2021-08-02': 'Aug 02',
      '2021-08-09': 'Aug 09',
      '2021-08-16': 'Aug 16',
      '2021-08-23': 'Aug 23',
      '2021-08-30': 'Aug 30',
      '2021-09-06': 'Sep 06',
      '2021-09-13': 'Sep 13',
      '2021-09-20': 'Sep 20',
      '2021-09-27': 'Sep 27',
      '2021-10-04': 'Oct 04',
      '2021-10-11': 'Oct 11',
      '2021-10-18': 'Oct 18',
      '2021-10-25': 'Oct 25',
      '2021-11-01': 'Nov 01',
      '2021-11-08': 'Nov 08',
      '2021-11-15': 'Nov 15',
      '2021-11-22': 'Nov 22',
      '2021-11-29': 'Nov 29',
      '2021-12-06': 'Dec 06',
      '2021-12-13': 'Dec 13',
      '2021-12-20': 'Dec 20',
      '2021-12-27': 'Dec 27',
      '2022-01-03': 'Jan 03',
    }
    Object.entries(year2021Weeks).forEach(([week, weekLabel]) => {
      expect(getMonthAndMondayDayLabel(week)).toEqual(weekLabel)
    })
  })
})

describe('filterTeamMetricsList', () => {
  it('should filter by team view if FEATURE_TEAM_VIEWS is on', () => {
    const originalList = [
      {
        name: 'foo',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: true,
      },
      {
        name: 'bar',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
      {
        name: 'foo',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
    ] as TeamMetrics[]
    const expected = [
      {
        name: 'foo',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: true,
      },
    ]
    const teamMetricsList = filterTeamMetricsList(
      originalList,
      {
        teamView: createTeamView({ name: 'foo' }),
        team: createTeam({ name: 'bar' }),
        valueStream: createValueStream({ name: 'biz' }),
        organization: createOrganization({ name: 'foo' }),
      },
      {
        FEATURE_TEAM_VIEWS: true,
      },
    )
    expect(teamMetricsList).toEqual(expected)
  })

  it('should filter only team metrics that are not views for value stream, and organization filter for FEATURE_TEAM_VIEWS', () => {
    const originalList = [
      {
        name: 'foo',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: true,
      },
      {
        name: 'bar',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
      {
        name: 'foo',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
    ] as TeamMetrics[]
    const expected = [
      {
        name: 'bar',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
      {
        name: 'foo',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
    ]
    const teamMetricsListVSFilter = filterTeamMetricsList(
      originalList,
      {
        valueStream: createValueStream({ name: 'biz' }),
        organization: createOrganization({ name: 'foo' }),
      },
      {
        FEATURE_TEAM_VIEWS: true,
      },
    )
    const teamMetricsListOrgFilter = filterTeamMetricsList(
      originalList,
      {
        organization: createOrganization({ name: 'foo' }),
      },
      { FEATURE_TEAM_VIEWS: true },
    )

    expect(teamMetricsListOrgFilter).toEqual(expected)
    expect(teamMetricsListVSFilter).toEqual(expected)
  })

  it('should filter by team', () => {
    const originalList = [
      {
        name: 'bar',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
      {
        name: 'foo',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
    ] as TeamMetrics[]
    const expected = [
      {
        name: 'foo',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
    ]
    const teamMetricsList = filterTeamMetricsList(
      originalList,
      {
        team: createTeam({ name: 'foo' }),
        valueStream: createValueStream({ name: 'biz' }),
        organization: createOrganization({ name: 'foo' }),
      },
      {},
    )
    expect(teamMetricsList).toEqual(expected)
  })

  it('should filter by value stream', () => {
    const originalList = [
      {
        name: 'bar',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
      {
        name: 'foo',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
      {
        name: 'baz',
        valueStreamName: 'another',
        organizationName: 'foo',
        isView: false,
      },
    ] as TeamMetrics[]
    const expected = [
      {
        name: 'bar',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
      {
        name: 'foo',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
    ]
    const teamMetricsList = filterTeamMetricsList(
      originalList,
      {
        valueStream: createValueStream({ name: 'biz' }),
        organization: createOrganization({ name: 'foo' }),
      },
      {},
    )
    expect(teamMetricsList).toEqual(expected)
  })

  it('otherwise it should returned the fetched team metrics list', () => {
    const originalList = [
      {
        name: 'bar',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
      {
        name: 'foo',
        valueStreamName: 'biz',
        organizationName: 'foo',
        isView: false,
      },
      {
        name: 'baz',
        valueStreamName: 'another',
        organizationName: 'foo',
        isView: false,
      },
    ] as TeamMetrics[]
    const teamMetricsList = filterTeamMetricsList(
      originalList,
      { organization: createOrganization({ name: 'foo' }) },
      {},
    )
    expect(teamMetricsList).toEqual(originalList)
  })
})

describe('getMondayOfCurrentWeek', () => {
  const expected = new Date('2020-12-28')

  afterEach(jest.useRealTimers)

  it('should return the right monday if day is Monday', () => {
    jest.useFakeTimers({ now: expected })
    expect(new Date().getTime()).toEqual(expected.getTime())
    expect(getMondayOfCurrentWeek()).toEqual(expected)
  })

  it('should return the right monday if day is Tuesday', () => {
    jest.useFakeTimers({ now: new Date('2020-12-29') })
    expect(new Date().getTime()).toEqual(new Date('2020-12-29').getTime())
    expect(getMondayOfCurrentWeek()).toEqual(expected)
  })

  it('should return the right monday if day is Wednesday', () => {
    jest.useFakeTimers({ now: new Date('2020-12-30') })
    expect(new Date().getTime()).toEqual(new Date('2020-12-30').getTime())
    expect(getMondayOfCurrentWeek()).toEqual(expected)
  })

  it('should return the right monday if day is Thursday', () => {
    jest.useFakeTimers({ now: new Date('2020-12-31') })
    expect(new Date().getTime()).toEqual(new Date('2020-12-31').getTime())
    expect(getMondayOfCurrentWeek()).toEqual(expected)
  })

  it('should return the right monday if day is Friday', () => {
    jest.useFakeTimers({ now: new Date('2021-01-01') })
    expect(new Date().getTime()).toEqual(new Date('2021-01-01').getTime())
    expect(getMondayOfCurrentWeek()).toEqual(expected)
  })

  it('should return the right monday if day is Saturday', () => {
    jest.useFakeTimers({ now: new Date('2021-01-02') })
    expect(new Date().getTime()).toEqual(new Date('2021-01-02').getTime())
    expect(getMondayOfCurrentWeek()).toEqual(expected)
  })

  it('should return the right monday if day is Sunday', () => {
    jest.useFakeTimers({ now: new Date('2021-01-03') })
    expect(new Date().getTime()).toEqual(new Date('2021-01-03').getTime())
    expect(getMondayOfCurrentWeek()).toEqual(expected)
  })
})

describe('padAndSortAscendingWeekEntires', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2021-06-27') })
    expect(new Date().getTime()).toEqual(new Date('2021-06-27').getTime())
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should show data within the week range only', () => {
    const entries = [
      { week: '2021-05-17', a: 1 },
      { week: '2021-05-24', a: 2 },
      { week: '2021-05-31', a: 3 },
      { week: '2021-06-07', a: 4 },
      { week: '2021-06-14', a: 5 },
      { week: '2021-06-21', a: 6 },
    ]
    const padData = { week: '', a: 0 }
    expect(
      padAndSortAscendingWeekEntires(entries, padData, 4).map(
        ({ week }) => week,
      ),
    ).toEqual([
      '2021-05-24',
      '2021-05-31',
      '2021-06-07',
      '2021-06-14',
      '2021-06-21',
    ])
  })

  it('should sort data by week string key', () => {
    const entries = [
      { week: '2021-05-17', a: 1 },
      { week: '2021-05-31', a: 2 },
      { week: '2021-05-24', a: 3 },
      { week: '2021-06-14', a: 4 },
      { week: '2021-06-07', a: 5 },
    ]
    const padData = { week: '', a: 0 }
    expect(
      padAndSortAscendingWeekEntires(entries, padData, 4).map(
        ({ week }) => week,
      ),
    ).toEqual([
      '2021-05-24',
      '2021-05-31',
      '2021-06-07',
      '2021-06-14',
      '2021-06-21',
    ])
  })

  it('should sort data by week string key (sorting by year first)', () => {
    jest.useFakeTimers({ now: new Date('2021-01-04') })
    expect(new Date().getTime()).toEqual(new Date('2021-01-04').getTime())

    const entries = [
      { week: '2021-01-04', a: 1 },
      { week: '2020-12-58', a: 3 },
      { week: '2020-12-21', a: 2 },
    ]
    const padData = { week: '', a: 0 }
    expect(
      padAndSortAscendingWeekEntires(entries, padData, 2).map(
        ({ week }) => week,
      ),
    ).toEqual(['2020-12-21', '2020-12-28', '2021-01-04'])
  })

  it('should fill missing week entires with pad data', () => {
    const entries = [
      { week: '2021-05-17', a: 1 },
      { week: '2021-05-31', a: 2 },
      { week: '2021-06-07', a: 3 },
      { week: '2021-06-14', a: 4 },
    ]
    const padData = { week: '', a: 0 }
    const result = padAndSortAscendingWeekEntires(entries, padData, 4)
    expect(result.some(entry => entry.week === '2021-05-24')).toBe(true)
    expect(result.find(entry => entry.week === '2021-05-24').a).toEqual(0)
  })

  it('should have all data when looking back a year for years with 53 weeks', () => {
    jest.useFakeTimers({ now: new Date('2021-01-03') })
    expect(new Date().getTime()).toEqual(new Date('2021-01-03').getTime())

    const weekKeysForYear2020 = (() => {
      const currentDate = new Date(2019, 11, 30)
      const weekKeys: string[] = []
      for (let i = 1; i <= 53; i += 1) {
        const day =
          currentDate.getDate() >= 10
            ? `${currentDate.getDate()}`
            : `0${currentDate.getDate()}`
        const month =
          currentDate.getMonth() + 1 >= 10
            ? `${currentDate.getMonth() + 1}`
            : `0${currentDate.getMonth() + 1}`
        weekKeys.push(`${currentDate.getFullYear()}-${month}-${day}`)
        currentDate.setDate(currentDate.getDate() + 7)
      }
      return weekKeys
    })()

    const entries = [
      { week: '2021-05-17', a: 1 },
      { week: '2021-05-31', a: 2 },
      { week: '2021-05-24', a: 3 },
      { week: '2021-06-14', a: 4 },
      { week: '2021-06-07', a: 5 },
    ]

    const padData = { week: '', a: 0 }

    const weekKeys = padAndSortAscendingWeekEntires(entries, padData, 52).map(
      ({ week }) => week,
    )
    expect(weekKeys).toEqual(weekKeysForYear2020)
  })

  it('should have all data when looking back a year for years with 52 weeks', () => {
    jest.useFakeTimers({ now: new Date('2022-01-02') })
    expect(new Date().getTime()).toEqual(new Date('2022-01-02').getTime())
    const weekKeysForYear2021 = (() => {
      const currentDate = new Date(2020, 11, 28)
      const weekKeys: string[] = []
      for (let i = 1; i <= 53; i += 1) {
        const day =
          currentDate.getDate() >= 10
            ? `${currentDate.getDate()}`
            : `0${currentDate.getDate()}`
        const month =
          currentDate.getMonth() + 1 >= 10
            ? `${currentDate.getMonth() + 1}`
            : `0${currentDate.getMonth() + 1}`
        weekKeys.push(`${currentDate.getFullYear()}-${month}-${day}`)
        currentDate.setDate(currentDate.getDate() + 7)
      }
      return weekKeys
    })()

    const entries = []

    const padData = { week: '', a: 0 }

    const weekKeys = padAndSortAscendingWeekEntires(entries, padData, 52).map(
      ({ week }) => week,
    )
    expect(weekKeys).toEqual(weekKeysForYear2021)
  })
})

describe('getLastUpdatedMessage', () => {
  it('should return an error message if server data is not a valid number for unix time', () => {
    const badUpdateTimes = [
      {
        lastUpdated: {
          workflow: 0,
          scm: -1,
          build: -1,
        },
      },
    ] as unknown as TeamMetrics[]
    const {
      workflow: workflowMsg,
      scm: scmMsg,
      build: buildMsg,
    } = getLastUpdatedMessage(badUpdateTimes)
    expect(workflowMsg).toEqual('ERR (updated time not a positive integer)')
    expect(scmMsg).toEqual('ERR (updated time not a positive integer)')
    expect(buildMsg).toEqual('ERR (updated time not a positive integer)')
  })

  it('should return the last updated message if server data for last updated time stamp is valid', () => {
    const dayAgo = new Date()
    dayAgo.setDate(dayAgo.getDate() - 1)
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1)
    const oneDayInMins = 60 * 24
    const goodUpdateTimes = [
      {
        lastUpdated: {
          workflow: dayAgo.getTime() / 1000,
          scm: dayAgo.getTime() / 1000,
          build: dayAgo.getTime() / 1000,
        },
      },
      {
        lastUpdated: {
          workflow: twoDaysAgo.getTime() / 1000,
          scm: twoDaysAgo.getTime() / 1000,
          build: twoDaysAgo.getTime() / 1000,
        },
      },
      {
        lastUpdated: {
          workflow: 0,
          scm: -1,
          build: -1,
        },
      },
    ] as unknown as TeamMetrics[]
    const {
      workflow: workflowMsg,
      scm: scmMsg,
      build: buildMsg,
    } = getLastUpdatedMessage(goodUpdateTimes)
    expect(workflowMsg).toEqual(`Updated ${oneDayInMins} minute(s) ago`)
    expect(scmMsg).toEqual(`Updated ${oneDayInMins} minute(s) ago`)
    expect(buildMsg).toEqual(`Updated ${oneDayInMins} minute(s) ago`)
  })
})

describe('safeDivide', () => {
  it('should return 0 if denominator is 0', () => {
    expect(safeDivide(0, 0)).toEqual(0)
  })

  it('should return the division otherwise', () => {
    expect(safeDivide(4, 2)).toEqual(2)
  })
})

describe('roundValue', () => {
  it('should round the value to right amount of decimal places', () => {
    expect(roundValue(11.23, 1)).toEqual(11.2)
    expect(roundValue(11.23, 2)).toEqual(11.23)
  })
})

describe('axisMaxDomain', () => {
  it('should return the max between rounded dataMax value * 1.2 and dataMax + 1', () => {
    expect(axisMaxDomain(10)).toEqual(12)
  })
})

describe('getMinutesAgo', () => {
  afterEach(jest.useRealTimers)

  it('should return the minutes ago since a given unix milliseconds since epoch', () => {
    jest.useFakeTimers({ now: new Date('2021-06-14') })
    expect(new Date().getTime()).toEqual(new Date('2021-06-14').getTime())

    const tenMinutesAgo = new Date()
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10)

    expect(getMinutesAgo(tenMinutesAgo.getTime())).toEqual(10)
  })
})

describe('getHoursAgo', () => {
  afterEach(jest.useRealTimers)

  it('should return the hours ago since a given unix milliseconds since epoch', () => {
    jest.useFakeTimers({ now: new Date('2021-06-14') })
    expect(new Date().getTime()).toEqual(new Date('2021-06-14').getTime())

    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    expect(getHoursAgo(oneHourAgo.getTime())).toEqual(1)
  })
})

describe('getDaysAgo', () => {
  afterEach(jest.useRealTimers)

  it('should return the days ago since a given unix milliseconds since epoch', () => {
    jest.useFakeTimers({ now: new Date('2021-06-14') })
    expect(new Date().getTime()).toEqual(new Date('2021-06-14').getTime())

    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    expect(getDaysAgo(twoDaysAgo.getTime())).toEqual(2)
  })
})
