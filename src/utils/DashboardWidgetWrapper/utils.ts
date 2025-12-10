import {
  FeatureFlags,
  Organization,
  Team,
  TeamMetrics,
  TeamView,
  ValueStream,
  getImplementationFromFeatureFlags,
} from 'api'

/**
 * Get the month and monday day label of
 * the week key (a date in formate yyyy-dd-mm)
 */
export const getMonthAndMondayDayLabel = (week: string): string => {
  const mondayOfWeek = new Date(week)

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return mondayOfWeek.getUTCDate() < 10
    ? `${monthNames[mondayOfWeek.getUTCMonth()]} 0${mondayOfWeek.getUTCDate()}`
    : `${monthNames[mondayOfWeek.getUTCMonth()]} ${mondayOfWeek.getUTCDate()}`
}

export const getMondayOfCurrentWeek = () => {
  const positiveMod = (numerator: number, denominator: number) =>
    ((numerator % denominator) + denominator) % denominator
  const mondayOfCurrentWeek = new Date()
  const DAYS_IN_WEEK = 7
  // if we are on a day > monday i.e. tuesday, wednesday, thursday, friday,
  // and saturday, we want the monday that was the date before the
  // day. Otherwise, if we are on a Sunday, i.e. getDay() === 0
  // then we want to be on the monday of the week the sunday is on.
  mondayOfCurrentWeek.setUTCDate(
    mondayOfCurrentWeek.getUTCDate() -
      positiveMod(mondayOfCurrentWeek.getUTCDay() - 1, DAYS_IN_WEEK),
  )
  return mondayOfCurrentWeek
}

export const padAndSortAscendingWeekEntires = <Entry extends { week: string }>(
  entries: Entry[],
  padData: Entry,
  weekRange: number,
) => {
  const allWeekKeys = (() => {
    const result = Array<string>(weekRange + 1)
    const mondayOfCurrentWeek = getMondayOfCurrentWeek()
    const DAYS_IN_WEEK = 7
    for (let weeksAgo = result.length - 1; weeksAgo >= 0; weeksAgo -= 1) {
      const month =
        mondayOfCurrentWeek.getUTCMonth() + 1 >= 10
          ? `${mondayOfCurrentWeek.getUTCMonth() + 1}`
          : `0${mondayOfCurrentWeek.getUTCMonth() + 1}`
      const day =
        mondayOfCurrentWeek.getUTCDate() >= 10
          ? `${mondayOfCurrentWeek.getUTCDate()}`
          : `0${mondayOfCurrentWeek.getUTCDate()}`
      result[weeksAgo] =
        `${mondayOfCurrentWeek.getUTCFullYear()}-${month}-${day}`
      mondayOfCurrentWeek.setUTCDate(
        mondayOfCurrentWeek.getUTCDate() - DAYS_IN_WEEK,
      )
    }
    return result
  })()
  const weekToEntryTable: { [week: string]: Entry } = {}
  for (const entry of entries) {
    weekToEntryTable[entry.week] = entry
  }
  return allWeekKeys
    .map(week => {
      if (week in weekToEntryTable) {
        return weekToEntryTable[week]
      }
      return { ...padData, week }
    })
    .sort(
      (entryA, entryB) =>
        new Date(entryA.week).getTime() - new Date(entryB.week).getTime(),
    )
}

const getMinutesAgoForUnixInSecs = (timeUnixInSecs?: number) => {
  if (!timeUnixInSecs || timeUnixInSecs <= 0) {
    return NaN
  }
  const now = new Date().getTime() / 1000
  const secondsPerMinute = 60
  return Math.round(Math.abs(timeUnixInSecs - now) / secondsPerMinute)
}

const outputLastUpdated = (minutesDifference: number) => {
  const badDataOutput = 'ERR (updated time not a positive integer)'
  return !Number.isNaN(minutesDifference) && minutesDifference > 0
    ? `Updated ${Math.round(minutesDifference)} minute(s) ago`
    : badDataOutput
}

export const getLastUpdatedMessage = (apiMetrics: TeamMetrics[]) => {
  const latest = (minutesAgoA: number, minutesAgoB: number) => {
    if (Number.isNaN(minutesAgoB)) {
      return minutesAgoA
    }
    if (Number.isNaN(minutesAgoA)) {
      return minutesAgoB
    }
    return Math.min(minutesAgoA, minutesAgoB)
  }
  const { workflow, scm, build, projectAnalysis } = apiMetrics.reduce(
    (lastUpdated, teamMetrics) => ({
      workflow: latest(
        lastUpdated.workflow,
        getMinutesAgoForUnixInSecs(teamMetrics.lastUpdated.workflow),
      ),
      scm: latest(
        lastUpdated.scm,
        getMinutesAgoForUnixInSecs(teamMetrics.lastUpdated.scm),
      ),
      build: latest(
        lastUpdated.build,
        getMinutesAgoForUnixInSecs(teamMetrics.lastUpdated.build),
      ),
      projectAnalysis: latest(
        lastUpdated.projectAnalysis,
        getMinutesAgoForUnixInSecs(teamMetrics.lastUpdated.project_analysis),
      ),
    }),
    {
      workflow: getMinutesAgoForUnixInSecs(-1),
      scm: getMinutesAgoForUnixInSecs(-1),
      build: getMinutesAgoForUnixInSecs(-1),
      projectAnalysis: getMinutesAgoForUnixInSecs(-1),
    },
  )
  return {
    workflow: outputLastUpdated(workflow),
    scm: outputLastUpdated(scm),
    build: outputLastUpdated(build),
    projectAnalysis: outputLastUpdated(projectAnalysis),
  }
}

type DashboardFilterParameters = {
  organization: Organization
  valueStream?: ValueStream
  team?: Team
  teamView?: TeamView
}

export const filterTeamMetricsList = (
  apiMetrics: TeamMetrics[],
  filterParameters: DashboardFilterParameters,
  featureFlags: FeatureFlags,
) => {
  const { organization, valueStream, team, teamView } = filterParameters
  const baseImplementation = () => {
    if (!!team && !!valueStream) {
      return apiMetrics.filter(
        teamMetrics =>
          teamMetrics.name === team.name &&
          teamMetrics.valueStreamName === valueStream.name &&
          teamMetrics.organizationName === organization.name,
      )
    }
    if (valueStream) {
      return apiMetrics.filter(
        teamMetrics =>
          teamMetrics.valueStreamName === valueStream.name &&
          teamMetrics.organizationName === organization.name,
      )
    }
    return apiMetrics.filter(
      teamMetrics => teamMetrics.organizationName === organization.name,
    )
  }
  return getImplementationFromFeatureFlags(featureFlags, {
    FEATURE_TEAM_VIEWS: () => {
      if (!!teamView && !!valueStream) {
        return apiMetrics.filter(
          teamMetrics =>
            teamMetrics.name === teamView.name &&
            teamMetrics.valueStreamName === valueStream.name &&
            teamMetrics.organizationName === organization.name &&
            teamMetrics.isView,
        )
      }
      return baseImplementation().filter(teamMetrics => !teamMetrics.isView)
    },
    default: baseImplementation,
  })()
}

export const safeDivide = (numerator: number, denominator: number) =>
  denominator === 0 ? 0 : numerator / denominator

export const roundValue = (value: number, decimalPlaces = 1) =>
  Number(Number(value).toFixed(decimalPlaces))

export const axisMaxDomain = (dataMax: number): number =>
  Math.max(Math.round(dataMax * 1.2), dataMax + 1)

const getMillisecondsAgo = (unixTimestamp: number): number => {
  const now = new Date().getTime()
  const timeStampTime = new Date(unixTimestamp).getTime()
  return Math.abs(now - timeStampTime)
}

export const getMinutesAgo = (unixTimestamp: number): number => {
  const millisecsPerMinute = 1000 * 60
  return getMillisecondsAgo(unixTimestamp) / millisecsPerMinute
}

export const getHoursAgo = (unixTimestamp: number): number => {
  const millisecsPerHour = 1000 * 60 * 60
  return getMillisecondsAgo(unixTimestamp) / millisecsPerHour
}

export const getDaysAgo = (unixTimestamp: number): number => {
  const millisecsPerDay = 1000 * 60 * 60 * 24
  return getMillisecondsAgo(unixTimestamp) / millisecsPerDay
}
