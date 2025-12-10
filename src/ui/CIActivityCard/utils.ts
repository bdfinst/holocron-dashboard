import { TeamMetrics, FeatureFlags } from 'api'
import {
  getMondayOfCurrentWeek,
  getMonthAndMondayDayLabel,
  padAndSortAscendingWeekEntires,
  safeDivide,
} from 'utils/DashboardWidgetWrapper'

export type CIActivityChartDataPoint = {
  xAxisTick: string
  week: string
  totalInternalIntegrations: number
  totalDirectIntegrations: number
  totalExternalIntegrations: number
  minimumIntegrationsNeeded: number
  percentProgressToCI: number
  averageTeamSize: number
}

const MAX_DAYS_IN_WEEK_THAT_CAN_BE_USED_FOR_INTEGRATIONS = 5

export const getPercentProgressToCIInformation = (
  week: string,
  totalInternalIntegrations: number,
  averageTeamSize: number,
) => {
  const monday = getMondayOfCurrentWeek()
  const month =
    monday.getUTCMonth() + 1 >= 10
      ? `${monday.getUTCMonth() + 1}`
      : `0${monday.getUTCMonth() + 1}`
  const day =
    monday.getUTCDate() >= 10
      ? `${monday.getUTCDate()}`
      : `0${monday.getUTCDate()}`
  const mondayFormattedAsWeek = `${monday.getUTCFullYear()}-${month}-${day}`

  // if the day is monday, day is 1,
  // tuesday is 2 and so on until sunday is 0,
  // and saturday is 6. So, days passed in week on
  // monday is 1, and likewise vice versa, until
  // sunday and saturday we want it to be 7 days
  // passed.
  const isCurrentWeek = mondayFormattedAsWeek === week
  const [SUNDAY_INDEX, SATURDAY_INDEX] = [0, 6]
  const todayDay = new Date().getUTCDay()
  const daysPassedInWeek =
    isCurrentWeek && todayDay !== SUNDAY_INDEX && todayDay !== SATURDAY_INDEX
      ? todayDay
      : MAX_DAYS_IN_WEEK_THAT_CAN_BE_USED_FOR_INTEGRATIONS

  const minCIForWeek = daysPassedInWeek * averageTeamSize
  return {
    percentProgressToCI: Math.round(
      safeDivide(totalInternalIntegrations, minCIForWeek) * 100,
    ),
    minimumIntegrationsNeeded: Math.round(minCIForWeek),
  }
}

export const getCIActivityChartData = ({
  apiMetrics,
  weekRange,
  featureFlags,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
  featureFlags: FeatureFlags
}): CIActivityChartDataPoint[] => {
  // since it is a team only widget when computing metrics,
  // there should only be one team/teamView (if FEATURE_TEAM_VIEWS
  // is on.)
  const [teamMetrics] = apiMetrics
  const { FEATURE_EXTERNAL_CONTRIBUTORS } = featureFlags

  const { historicalData } = teamMetrics

  const points = historicalData.map(entry => {
    const { minimumIntegrationsNeeded, percentProgressToCI } =
      getPercentProgressToCIInformation(
        entry.week,
        entry.totalInternalIntegrations,
        entry.averageTeamSize,
      )

    return {
      week: entry.week,
      totalInternalIntegrations: entry.totalInternalIntegrations,
      totalDirectIntegrations: entry.totalDirectIntegrations,
      totalExternalIntegrations: FEATURE_EXTERNAL_CONTRIBUTORS
        ? entry.totalExternalIntegrations
        : 0,
      minimumIntegrationsNeeded,
      percentProgressToCI,
      averageTeamSize: entry.averageTeamSize,
    }
  })

  return padAndSortAscendingWeekEntires(
    points,
    {
      week: '',
      totalInternalIntegrations: 0,
      totalDirectIntegrations: 0,
      totalExternalIntegrations: 0,
      minimumIntegrationsNeeded: 0,
      percentProgressToCI: 0,
      averageTeamSize: 0,
    },
    weekRange,
  ).map(item => ({
    ...item,
    xAxisTick: getMonthAndMondayDayLabel(item.week),
  }))
}
