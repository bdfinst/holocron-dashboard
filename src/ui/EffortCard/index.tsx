import { Grid, Typography } from '@mui/material'
import { TeamMetrics, useAPIContext } from 'api'
import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  getLastUpdatedMessage,
} from 'utils/DashboardWidgetWrapper'
import EffortCostsAggregateTable from './EffortCostsAggregateTable'
import EffortCostsChart, { getEffortCostsChartData } from './EffortCostsChart'
import EffortDaysChart, { getEffortDaysChartData } from './EffortDaysChart'
import helpContent from './helpContent.md'

export type EffortCardProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  apiMetrics: TeamMetrics[]
  showDetails?: boolean
  weekRange: number
}

const doesNotHaveEnoughData = (
  daysData: ReturnType<typeof getEffortDaysChartData>,
) =>
  daysData.every(
    point =>
      point.daysSpentOnFeatures === 0 &&
      point.daysSpentOnDefects === 0 &&
      point.daysSpentOnMaintenance === 0 &&
      point.daysSpentOnUnplanned === 0,
  )

const AdditionalInformation = ({
  apiMetrics,
  weekRange,
}: Omit<EffortCardProps, 'cardProps' | 'contentProps'>) => {
  const daysData = getEffortDaysChartData({
    apiMetrics,
    weekRange,
  })
  const costsData = getEffortCostsChartData({
    apiMetrics,
    weekRange,
  })
  const notEnoughData = doesNotHaveEnoughData(daysData)

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DashboardWidgetWrapper
          title="Relative Effort (FTE)"
          notEnoughData={notEnoughData}
          cardProps={{
            variant: 'outlined',
            sx: {
              textAlign: 'center',
              color: 'text.secondary',
              p: 1,
            },
          }}
          contentProps={{
            sx: {
              height: { md: 200, xs: 400 },
            },
          }}
        >
          <EffortDaysChart data={daysData} />
        </DashboardWidgetWrapper>
      </Grid>
      <Grid item sm={6} xs={12}>
        <DashboardWidgetWrapper
          title="Effort Costs"
          notEnoughData={notEnoughData}
          cardProps={{
            variant: 'outlined',
            sx: {
              textAlign: 'center',
              color: 'text.secondary',
              p: 1,
            },
          }}
          contentProps={{
            sx: {
              height: { md: 200, xs: 400 },
            },
          }}
        >
          <EffortCostsChart data={costsData} />
        </DashboardWidgetWrapper>
      </Grid>
      <Grid item sm={6} xs={12}>
        <EffortCostsAggregateTable data={costsData} />
      </Grid>
    </Grid>
  )
}

const EffortCard = ({
  apiMetrics,
  weekRange,
  showDetails = false,
  cardProps,
  contentProps,
}: EffortCardProps) => {
  const { featureFlags } = useAPIContext()
  const daysData = getEffortDaysChartData({
    apiMetrics,
    weekRange,
  })
  const { workflow: lastUpdatedMessage } = getLastUpdatedMessage(apiMetrics)
  const notEnoughData = doesNotHaveEnoughData(daysData)

  return (
    <DashboardWidgetWrapper
      title="Relative Effort (FTE)"
      helpContent={helpContent}
      notEnoughData={notEnoughData}
      Footer={
        <Typography
          aria-label="Relative Effort (FTE) Last Updated Message"
          variant="caption"
        >
          {lastUpdatedMessage}
        </Typography>
      }
      AdditionalInformation={
        showDetails &&
        featureFlags.FEATURE_COST_METRICS && (
          <AdditionalInformation
            apiMetrics={apiMetrics}
            weekRange={weekRange}
          />
        )
      }
      cardProps={cardProps}
      contentProps={contentProps}
    >
      <EffortDaysChart data={daysData} />
    </DashboardWidgetWrapper>
  )
}

export default EffortCard
