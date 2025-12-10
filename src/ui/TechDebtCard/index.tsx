import { TeamMetrics } from 'api'
import { Grid, Stack, Typography, useTheme } from '@mui/material'
import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  getLastUpdatedMessage,
} from 'utils/DashboardWidgetWrapper'
import TrendIndicator from 'utils/TrendIndicator'
import TechDebtTrendChart, {
  getTechDebtTrendChartData,
} from './TechDebtTrendChart'
import helpContent from './helpContent.md'
import TechDebtTrendBySeverityChart, {
  getTechDebtTrendBySeverityChartData,
} from './TechDebtTrendBySeverityChart'
import {
  ActiveMaintainabilityIssuesTable,
  ActivePossibleBugsTable,
  ActiveUnknownIssuesTable,
} from './ActiveTechDebtsTables'

export type TechDebtTrendCardProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & { apiMetrics: TeamMetrics[]; weekRange: number } & { showDetails: boolean }

const AdditionalInformation = ({
  apiMetrics,
  weekRange,
}: Omit<
  TechDebtTrendCardProps,
  'cardProps' | 'contentProps' | 'showDetails'
>) => {
  const theme = useTheme()

  const techDebtsBySeverityChartData = getTechDebtTrendBySeverityChartData({
    apiMetrics,
    weekRange,
  })

  const hasEnoughTechDebtsTrendChartData =
    techDebtsBySeverityChartData.some(
      entry =>
        entry.highSeverityTechDebts > 0 ||
        entry.mediumSeverityTechDebts > 0 ||
        entry.lowSeverityTechDebts > 0,
    ) && techDebtsBySeverityChartData.length >= 2

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DashboardWidgetWrapper
          title="Tech Debts Trend By Severity"
          notEnoughData={!hasEnoughTechDebtsTrendChartData}
          Footer={
            hasEnoughTechDebtsTrendChartData && (
              <Grid container justifyContent="space-between">
                <Grid
                  item
                  md={4}
                  xs={12}
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                  }}
                >
                  <TrendIndicator
                    beforeValue={
                      techDebtsBySeverityChartData[
                        techDebtsBySeverityChartData.length - 2
                      ].highSeverityTechDebts
                    }
                    afterValue={
                      techDebtsBySeverityChartData[
                        techDebtsBySeverityChartData.length - 1
                      ].highSeverityTechDebts
                    }
                    title="High Severity Tech Debts"
                    titleProps={{
                      color: theme.chart.red,
                    }}
                    timeFrame="week"
                  />
                </Grid>
                <Grid
                  item
                  md={4}
                  xs={12}
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                  }}
                >
                  <TrendIndicator
                    beforeValue={
                      techDebtsBySeverityChartData[
                        techDebtsBySeverityChartData.length - 2
                      ].mediumSeverityTechDebts
                    }
                    afterValue={
                      techDebtsBySeverityChartData[
                        techDebtsBySeverityChartData.length - 1
                      ].mediumSeverityTechDebts
                    }
                    title="Medium Severity Tech Debts"
                    titleProps={{
                      color: theme.chart.yellow,
                    }}
                    timeFrame="week"
                  />
                </Grid>
                <Grid
                  item
                  md={4}
                  xs={12}
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                  }}
                >
                  <TrendIndicator
                    beforeValue={
                      techDebtsBySeverityChartData[
                        techDebtsBySeverityChartData.length - 2
                      ].lowSeverityTechDebts
                    }
                    afterValue={
                      techDebtsBySeverityChartData[
                        techDebtsBySeverityChartData.length - 1
                      ].lowSeverityTechDebts
                    }
                    title="Low Severity Tech Debts"
                    titleProps={{
                      color: theme.chart.blue,
                    }}
                    timeFrame="week"
                  />
                </Grid>
              </Grid>
            )
          }
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
              height: { md: 400, xs: 800 },
            },
          }}
        >
          <TechDebtTrendBySeverityChart data={techDebtsBySeverityChartData} />
        </DashboardWidgetWrapper>
      </Grid>
      <Grid item md={6} xs={12}>
        <ActiveMaintainabilityIssuesTable apiMetrics={apiMetrics} />
      </Grid>
      <Grid item md={6} xs={12}>
        <ActivePossibleBugsTable apiMetrics={apiMetrics} />
      </Grid>
      <Grid item md={6} xs={12}>
        <ActiveUnknownIssuesTable apiMetrics={apiMetrics} />
      </Grid>
    </Grid>
  )
}

const TechDebtTrendCard = ({
  apiMetrics,
  showDetails,
  weekRange,
  cardProps,
  contentProps,
}: TechDebtTrendCardProps) => {
  const techDebtTrendChartData = getTechDebtTrendChartData({
    apiMetrics,
    weekRange,
  })
  const { projectAnalysis: lastUpdatedMessage } =
    getLastUpdatedMessage(apiMetrics)

  const hasEnoughData =
    techDebtTrendChartData.some(p => p.totalTechDebt > 0) &&
    techDebtTrendChartData.length >= 2

  return (
    <DashboardWidgetWrapper
      title="Tech Debt"
      notEnoughData={!hasEnoughData}
      cardProps={cardProps}
      contentProps={contentProps}
      helpContent={helpContent}
      AdditionalInformation={
        showDetails && (
          <AdditionalInformation
            apiMetrics={apiMetrics}
            weekRange={weekRange}
          />
        )
      }
      Footer={
        <Stack>
          {hasEnoughData && (
            <TrendIndicator
              beforeValue={
                techDebtTrendChartData[techDebtTrendChartData.length - 2]
                  .totalTechDebt
              }
              afterValue={
                techDebtTrendChartData[techDebtTrendChartData.length - 1]
                  .totalTechDebt
              }
              timeFrame="week"
            />
          )}
          <Typography
            variant="caption"
            aria-label="Lead Time & Throughput Last Updated Footer"
          >
            {lastUpdatedMessage}
          </Typography>
        </Stack>
      }
    >
      <TechDebtTrendChart data={techDebtTrendChartData} />
    </DashboardWidgetWrapper>
  )
}

export default TechDebtTrendCard

export { ProjectIssueTable } from './ActiveTechDebtsTables'
